#!/bin/bash

# Porshi Android Build Verification Script
# Checks all prerequisites and build configuration

set -e

echo "🔍 Porshi Android Build Verification"
echo "===================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Function to check command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}❌${NC} $1 is NOT installed"
        ISSUES=$((ISSUES + 1))
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} Found: $1"
        return 0
    else
        echo -e "${RED}❌${NC} Missing: $1"
        ISSUES=$((ISSUES + 1))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} Found: $1"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC} Missing (optional): $1"
        return 1
    fi
}

echo "📋 System Requirements:"
echo "===================================================="
check_command "java"
check_command "node"
check_command "npm"
check_command "gradle"

echo ""
echo "📂 Required Files:"
echo "===================================================="
check_file ".github/workflows/android-build.yml"
check_file "android/build.gradle"
check_file "android/app/build.gradle"
check_file "android/settings.gradle"
check_file "android/gradle.properties"
check_file "android/local.properties.example"

echo ""
echo "📁 Required Directories:"
echo "===================================================="
check_dir "android"
check_dir "android/app"
check_dir "android/app/src"

echo ""
echo "🔧 Local Configuration:"
echo "===================================================="
if [ -f "android/local.properties" ]; then
    echo -e "${GREEN}✅${NC} android/local.properties exists"
else
    echo -e "${YELLOW}⚠️${NC} android/local.properties not found"
    if [ -f "android/local.properties.example" ]; then
        echo "   Copy from template:"
        echo "   cp android/local.properties.example android/local.properties"
        ISSUES=$((ISSUES + 1))
    fi
fi

echo ""
echo "🔍 Configuration Details:"
echo "===================================================="

# Check Node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "Node.js: $NODE_VERSION"
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge "18" ]; then
        echo -e "${GREEN}✅${NC} Node.js version is compatible (18+)"
    else
        echo -e "${RED}❌${NC} Node.js version is too old (need 18+)"
        ISSUES=$((ISSUES + 1))
    fi
fi

# Check Java version
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | grep -oP '(?<=") .*(?= 20)' | head -1)
    echo "Java: $(java -version 2>&1 | head -1)"
    echo -e "${GREEN}✅${NC} Java is installed"
fi

# Check gradle wrapper
if [ -f "android/gradlew" ]; then
    echo -e "${GREEN}✅${NC} Gradle wrapper found"
else
    echo -e "${YELLOW}⚠️${NC} Gradle wrapper not found in android/"
fi

echo ""
echo "🏗️ Build Configuration:"
echo "===================================================="

# Check gradle files for key settings
if grep -q "gradle:8.2.0" android/build.gradle 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Gradle 8.2.0 configured"
else
    echo -e "${YELLOW}⚠️${NC} Gradle 8.2.0 not found in build.gradle"
fi

if grep -q "compileSdk 34" android/app/build.gradle 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Compile SDK 34 configured"
else
    echo -e "${RED}❌${NC} Compile SDK 34 not configured"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "namespace \"com.porshi.app\"" android/app/build.gradle 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Namespace configured (com.porshi.app)"
else
    echo -e "${RED}❌${NC} Namespace not configured"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "lintOptions" android/app/build.gradle 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Lint options configured (non-blocking)"
else
    echo -e "${RED}❌${NC} Lint options not configured"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "📦 Dependencies:"
echo "===================================================="

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅${NC} package.json found"
    if grep -q "legacy-peer-deps" .github/workflows/android-build.yml 2>/dev/null; then
        echo -e "${GREEN}✅${NC} legacy-peer-deps flag configured"
    else
        echo -e "${YELLOW}⚠️${NC} legacy-peer-deps not in GitHub Actions"
    fi
fi

echo ""
echo "📊 Summary:"
echo "===================================================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You can now build the APK:"
    echo "  cd android"
    echo "  ./gradlew assembleDebug -x lint -x test"
    echo ""
else
    echo -e "${RED}❌ Found $ISSUES issue(s) that need attention${NC}"
    echo ""
    echo "Next steps:"
    if ! [ -f "android/local.properties" ]; then
        echo "1. Create android/local.properties from template"
    fi
    if ! command -v java &> /dev/null; then
        echo "2. Install Java Development Kit (JDK 11+)"
    fi
    if ! command -v node &> /dev/null; then
        echo "3. Install Node.js 20+"
    fi
    echo ""
fi

echo "===================================================="
echo "For more help, see ANDROID_BUILD_CONFIGURATION.md"
echo "===================================================="

exit $ISSUES
