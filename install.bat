@echo off
REM Script de instalación de dependencias para proyecto2 en Windows

setlocal enabledelayedexpansion

echo ================================
echo Instalación de Proyecto 2
echo ================================

REM Verificar que Node.js esté instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor, instala Node.js 18+
    exit /b 1
)

echo ✓ Node.js
node --version

REM Verificar que npm esté instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado
    exit /b 1
)

echo ✓ npm
npm --version

REM Instalar dependencias del backend
echo.
echo Instalando dependencias del backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al instalar backend
    exit /b 1
)
echo ✓ Backend instalado
cd ..

REM Instalar dependencias del frontend
echo.
echo Instalando dependencias del frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al instalar frontend
    exit /b 1
)
echo ✓ Frontend instalado
cd ..

echo.
echo ================================
echo ✓ Instalación completada
echo ================================
echo.
echo Próximos pasos:
echo 1. Iniciar PostgreSQL (docker-compose up -d)
echo 2. Ejecutar backend: cd backend ^&^& npm run dev
echo 3. Ejecutar frontend: cd frontend ^&^& npm run dev
echo 4. Abrir http://localhost:3000

pause
