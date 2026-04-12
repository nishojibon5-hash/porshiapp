#!/bin/bash

# Porshi Android Build Script
# Builds APK with hardened configuration

set -e

echo "🚀 Building Porshi Android APK"
echo "===================================================="
echo ""

# Default build type
BUILD_TYPE=${1:-debug}

# Validate build type
if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
    echo "❌ Invalid build type: $BUILD_TYPE"
    echo "Usage: ./scripts/build-android.sh [debug|release]"
    exit 1
fi

# Determine build command
if [ "$BUILD_TYPE" = "debug" ]; then
    BUILD_CMD="assembleDebug"
    OUTPUT_FILE="android/app/build/outputs/apk/debug/app-debug.apk"
else
    BUILD_CMD="assembleRelease"
    OUTPUT_FILE="android/app/build/outputs/apk/release/app-release.apk"
fi

echo "📋 Build Configuration:"
echo "   Build Type: $BUILD_TYPE"
echo "   Build Command: ./gradlew $BUILD_CMD -x lint -x test"
echo "   Output: $OUTPUT_FILE"
echo ""

# Verify prerequisites
echo "✅ Verifying prerequisites..."

if ! [ -d "android" ]; then
    echo "❌ android/ directory not found"
    exit 1
fi

if ! [ -f "android/local.properties" ]; then
    echo "❌ android/local.properties not found"
    echo "   Run: cp android/local.properties.example android/local.properties"
    exit 1
fi

if ! [ -f "android/gradlew" ]; then
    echo "❌ Gradle wrapper not found"
    exit 1
fi

# Make gradlew executable
chmod +x android/gradlew

echo "✅ All prerequisites satisfied"
echo ""

# Clean build (optional)
if [ "$2" = "--clean" ]; then
    echo "🧹 Cleaning previous build..."
    cd android
    ./gradlew clean
    cd ..
fi

# Build APK
echo "🔨 Building APK..."
echo "===================================================="

cd android

# Run with error handling
if ./gradlew $BUILD_CMD -x lint -x test --stacktrace; then
    echo ""
    echo "===================================================="
    echo -e "\033[0;32m✅ BUILD SUCCESSFUL\033[0m"
    echo "===================================================="
    echo ""
    echo "📱 APK Location:"
    echo "   $OUTPUT_FILE"
    echo ""
    
    # Check if APK exists and show size
    if [ -f "../$OUTPUT_FILE" ]; then
        SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo "📦 APK Size: $SIZE"
        echo ""
        echo "🎉 Ready to install on device or emulator"
        echo ""
        echo "Install on connected device:"
        echo "   adb install -r $OUTPUT_FILE"
        echo ""
    fi
    
    exit 0
else
    echo ""
    echo "===================================================="
    echo -e "\033[0;31m❌ BUILD FAILED\033[0m"
    echo "===================================================="
    echo ""
    echo "📖 Troubleshooting steps:"
    echo "1. Check that android/local.properties is configured"
    echo "2. Verify ANDROID_SDK_ROOT is set correctly"
    echo "3. Try cleaning: ./gradlew clean"
    echo "4. Check logs above for specific errors"
    echo "5. See ANDROID_BUILD_CONFIGURATION.md for detailed help"
    echo ""
    exit 1
fi
