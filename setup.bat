@echo off
REM BLACK RANGER Identity Vault - Setup Script (Windows)
REM This script helps set up the development environment

echo 🚀 BLACK RANGER Identity Vault - Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^>= 16.x
    exit /b 1
)

echo ✅ Node.js detected
node -v

echo.
echo 📦 Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install

REM Install client dependencies
echo Installing client dependencies...
cd ..\client
call npm install

cd ..

echo.
echo 🔑 Generating RSA keys...
cd server
node scripts\generate_keys.js
cd ..

echo.
echo 📝 Next steps:
echo 1. Create PostgreSQL database:
echo    psql -U postgres -c "CREATE DATABASE black_ranger_db;"
echo.
echo 2. Configure server\.env file:
echo    copy server\env.example server\.env
echo    REM Edit server\.env with your database credentials
echo.
echo 3. Run database migrations:
echo    cd server ^&^& npm run migrate
echo.
echo 4. Seed initial data:
echo    cd server ^&^& npm run seed
echo.
echo 5. Start development servers:
echo    npm run dev
echo.
echo ✅ Setup complete!
pause

