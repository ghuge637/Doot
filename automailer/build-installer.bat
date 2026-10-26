@echo off
setlocal
title Building Doot Installer
echo ========================================================
echo              BUILDING DOOT INSTALLER
echo ========================================================
echo.

set "PROJECT_DIR=E:\Project Setup\automailer"
set "FRONTEND_DIR=E:\Project Setup\frontend"
set "LAUNCH4J_HOME=E:\Project Setup\softwares\Launch4j"
set "INNO_SETUP_HOME=E:\Project Setup\softwares\Inno Setup 6"
set "WINSW_PATH=E:\Project Setup\softwares\WinSW\WinSW-x64.exe"
set "JAVA_HOME=D:\Program Files\Java\jdk-17.0.17.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo ERROR: Java 17 JDK not found at %JAVA_HOME%
    pause
    exit /b 1
)
if not exist "%WINSW_PATH%" (
    echo ERROR: WinSW x64 not found at %WINSW_PATH%
    pause
    exit /b 1
)

echo [1/6] Building the React frontend...
cd /d "%FRONTEND_DIR%"
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo [2/6] Building the Spring Boot application...
cd /d "%PROJECT_DIR%"
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo ERROR: Maven build failed!
    pause
    exit /b 1
)

echo [3/6] Creating the bundled Java runtime...
if exist "%PROJECT_DIR%\target\runtime" rmdir /s /q "%PROJECT_DIR%\target\runtime"
"%JAVA_HOME%\bin\jlink.exe" --add-modules java.se,jdk.crypto.ec,jdk.unsupported,jdk.zipfs --strip-debug --no-header-files --no-man-pages --compress=2 --output "%PROJECT_DIR%\target\runtime"
if errorlevel 1 (
    echo ERROR: Bundled Java runtime creation failed!
    pause
    exit /b 1
)

echo [4/6] Creating the Launch4j executable...
"%LAUNCH4J_HOME%\launch4jc.exe" "%PROJECT_DIR%\launch4j-config.xml"
if errorlevel 1 (
    echo ERROR: Launch4j failed!
    pause
    exit /b 1
)

echo [5/6] Creating the one-click installer...
"%INNO_SETUP_HOME%\ISCC.exe" "%PROJECT_DIR%\doot-installer.iss"
if errorlevel 1 (
    echo ERROR: Inno Setup failed!
    pause
    exit /b 1
)

echo [6/6] Build complete!
echo.
echo Installer created at:
echo %PROJECT_DIR%\target\Doot_Setup.exe
echo.
echo ========================================================
pause
endlocal
