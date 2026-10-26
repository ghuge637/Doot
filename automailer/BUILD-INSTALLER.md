# Doot Installer Build Guide

The installer packages the Spring Boot application, compiled React frontend, a bundled 64-bit Java runtime, and WinSW service wrapper into one Windows installer.

## Build prerequisites

1. Java 17 JDK at `D:\Program Files\Java\jdk-17.0.17.10-hotspot`
2. Node.js/npm for building the React frontend
3. Launch4j in `E:\Project Setup\softwares\Launch4j`
4. Inno Setup 6 in `E:\Project Setup\softwares\Inno Setup 6`
5. WinSW x64 at `E:\Project Setup\softwares\WinSW\WinSW-x64.exe`

## Build

Run:

```cmd
cd /d "E:\Project Setup\automailer"
build-installer.bat
```

The script builds the frontend and backend, creates `target\runtime` with `jlink`, wraps the application with Launch4j, and produces:

```text
E:\Project Setup\automailer\target\Doot_Setup.exe
```

## What the installer does

- Installs to `C:\Program Files\Doot\`
- Installs the bundled Java runtime, so Java is not required on the recipient's PC
- Registers and starts the `DootService` Windows service automatically
- Creates a Start Menu shortcut and optional desktop shortcut to `http://localhost:8080`
- Opens the browser after installation
- Restarts the service automatically if it exits unexpectedly

The installer targets 64-bit Windows. The service stores its database, uploads, and logs relative to the installation directory.
