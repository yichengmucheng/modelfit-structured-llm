@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if exist "%~dp0..\index.html" (
  cd /d "%~dp0.."
) else if not exist "%~dp0index.html" (
  echo [ERROR] index.html not found near %~dp0
  pause
  exit /b 1
)

set "DEMO_ROOT=%CD%"
set "PS1=%~dp0serve.ps1"
set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS_EXE%" set "PS_EXE=powershell"

echo.
echo ========================================
echo   ModelFit Demo Server
echo ========================================
echo.

if not exist "%DEMO_ROOT%\index.html" (
  echo [ERROR] index.html not found in: %DEMO_ROOT%
  pause
  exit /b 1
)
if not exist "%PS1%" (
  echo [ERROR] serve.ps1 not found in: %~dp0
  pause
  exit /b 1
)

echo Demo folder: %DEMO_ROOT%
echo Preferred port: 8081 (8082, 8083, ... if busy)
echo URL will be shown below when server starts.
echo Keep this window open while demoing.
echo.

title ModelFit Demo Server
color 0A

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -DemoRoot "%DEMO_ROOT%" -StartPort 8081

echo.
pause
exit /b %ERRORLEVEL%
