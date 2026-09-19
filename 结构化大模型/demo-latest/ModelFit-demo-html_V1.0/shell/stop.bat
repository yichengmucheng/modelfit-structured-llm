@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if exist "%~dp0..\index.html" (
  cd /d "%~dp0.."
) else if not exist "%~dp0index.html" (
  echo [ERROR] index.html not found near %~dp0
  pause
  exit /b 1
)

set "DEMO_ROOT=%CD%"
set "STATE=%DEMO_ROOT%\.demo-server.state"

echo.
echo ========================================
echo   ModelFit Demo Server - Stop
echo ========================================
echo.

set "STOPPED=0"

if exist "%STATE%" (
  set "PID="
  for /f "usebackq tokens=1,* delims==" %%A in ("%STATE%") do (
    if /i "%%A"=="pid" set "PID=%%B"
  )
  if defined PID (
    tasklist /FI "PID eq !PID!" 2>nul | find "!PID!" >nul
    if not errorlevel 1 (
      echo Stopping demo server PID !PID! ...
      taskkill /PID !PID! /T /F >nul 2>&1
      set "STOPPED=1"
    )
  )
  del "%STATE%" 2>nul
)

if "!STOPPED!"=="1" (
  echo Done.
) else (
  echo Demo server is not running.
)
echo.
pause
exit /b 0
