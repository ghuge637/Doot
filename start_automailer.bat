@echo off
title AutoMailer Launcher
echo ========================================================
echo        STARTING AUTOMAILER APPLICATION (LOCAL)
echo ========================================================
echo.

set JAVA_HOME=D:\Program Files\Java\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "AutoMailer - Spring Boot Backend" cmd /k "cd automailer && .\mvnw.cmd spring-boot:run"

echo [2/3] Waiting for Backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "AutoMailer - React Dashboard" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Launching AutoMailer in your browser...
start http://localhost:5173

echo.
echo AutoMailer is running! Keep the backend & frontend command windows open.
echo To close, simply close the respective terminal windows.
echo ========================================================
pause
