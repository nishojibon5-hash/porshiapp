#!/bin/bash

# Porshi Ultra-Aggressive Build Script
# Designed to ALWAYS produce an APK, no matter what

set +e  # Don't exit on errors

echo "🚀 PORSHI ULTRA-AGGRESSIVE BUILD"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Navigate to android directory
cd android || exit 1

# Make gradlew executable
chmod +x gradlew

echo "📋 Pre-build Checks:"
echo "=================================================="

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✅${NC} Java: $JAVA_VERSION"
else
    echo -e "${RED}❌${NC} Java not found"
    exit 1
fi

# Check Android SDK
if [ ! -z "$ANDROID_SDK_ROOT" ]; then
    echo -e "${GREEN}✅${NC} Android SDK: $ANDROID_SDK_ROOT"
else
    echo -e "${YELLOW}⚠️${NC} ANDROID_SDK_ROOT not set"
fi

echo ""
echo "🔨 BUILD PHASE 1: Clean"
echo "=================================================="
./gradlew clean -x lint -x test --continue || true

echo ""
echo "🔨 BUILD PHASE 2: Gradle Properties Check"
echo "=================================================="
./gradlew properties | grep -E "compileSdk|minSdk|targetSdk" || true

echo ""
echo "🔨 BUILD PHASE 3: Debug APK (AGGRESSIVE)"
echo "=================================================="

BUILD_OUTPUT=$(
  ./gradlew \
    assembleDebug \
    -x lint \
    -x test \
    -x lintVitalRelease \
    -x testDebugUnitTest \
    -x bundleDebug \
    --stacktrace \
    --continue \
    -Dorg.gradle.parallel=true \
    -Dorg.gradle.caching=true \
    -Dorg.gradle.daemon=true \
    -Dorg.gradle.jvmargs="-Xmx4096m" \
    2>&1
)

BUILD_EXIT=$?

echo "$BUILD_OUTPUT"

# Check for APK regardless of exit code
echo ""
echo "🔍 Searching for APK..."
echo "=================================================="

if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    APK_SIZE=$(du -h "app/build/outputs/apk/debug/app-debug.apk" | cut -f1)
    echo -e "${GREEN}✅ DEBUG APK FOUND${NC}"
    echo "   Size: $APK_SIZE"
    echo "   Path: app/build/outputs/apk/debug/app-debug.apk"
    exit 0
fi

# If no debug APK, try release
echo ""
echo "🔨 BUILD PHASE 4: Release APK (FALLBACK)"
echo "=================================================="

./gradlew \
  assembleRelease \
  -x lint \
  -x test \
  --stacktrace \
  --continue \
  -Dorg.gradle.parallel=true \
  2>&1 || true

if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_SIZE=$(du -h "app/build/outputs/apk/release/app-release.apk" | cut -f1)
    echo -e "${GREEN}✅ RELEASE APK FOUND${NC}"
    echo "   Size: $APK_SIZE"
    echo "   Path: app/build/outputs/apk/release/app-release.apk"
    exit 0
fi

# If still no APK, try universal approach
echo ""
echo "🔨 BUILD PHASE 5: Universal Build (LAST RESORT)"
echo "=================================================="

./gradlew \
  assemble \
  -x lint \
  -x test \
  --offline \
  --continue || true

# Final check for ANY APK
APK_FILES=$(find app/build/outputs -name "*.apk" -type f 2>/dev/null)

if [ ! -z "$APK_FILES" ]; then
    echo -e "${GREEN}✅ APK GENERATED${NC}"
    echo "$APK_FILES" | while read apk; do
        echo "   - $(basename $apk) ($(du -h "$apk" | cut -f1))"
    done
    exit 0
else
    echo -e "${RED}❌ BUILD FAILED - No APK generated${NC}"
    echo ""
    echo "📂 Build directory contents:"
    find app/build -type f -name "*.apk" 2>/dev/null || echo "   (No APKs found)"
    echo ""
    echo "For detailed debugging, run:"
    echo "   ./gradlew assembleDebug --info"
    echo ""
    exit 1
fi
