@echo off
echo Starting Next.js Development Server...
echo.
echo Available options:
echo 1. Standard dev server (recommended)
echo 2. Dev server with HTTPS
echo 3. Dev server without SWC
echo 4. Dev server with Turbopack
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting standard dev server...
    npm run dev
) else if "%choice%"=="2" (
    echo Starting dev server with HTTPS...
    npm run dev:https
) else if "%choice%"=="3" (
    echo Starting dev server without SWC...
    npm run dev:legacy
) else if "%choice%"=="4" (
    echo Starting dev server with Turbopack...
    npm run dev:turbo
) else (
    echo Invalid choice. Starting standard dev server...
    npm run dev
)

pause
