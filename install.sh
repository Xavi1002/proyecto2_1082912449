#!/bin/bash

# Script de instalación de dependencias para proyecto2

echo "================================"
echo "Instalación de Proyecto 2"
echo "================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+"
    exit 1
fi

echo -e "${BLUE}✓ Node.js ${NC}$(node --version)"

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo -e "${BLUE}✓ npm ${NC}$(npm --version)"

# Instalar dependencias del backend
echo -e "\n${BLUE}Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend instalado${NC}"
else
    echo -e "${RED}❌ Error al instalar backend${NC}"
    exit 1
fi
cd ..

# Instalar dependencias del frontend
echo -e "\n${BLUE}Instalando dependencias del frontend...${NC}"
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend instalado${NC}"
else
    echo -e "${RED}❌ Error al instalar frontend${NC}"
    exit 1
fi
cd ..

echo -e "\n${GREEN}================================"
echo "✓ Instalación completada"
echo "================================${NC}"
echo -e "\n${BLUE}Próximos pasos:${NC}"
echo "1. Iniciar PostgreSQL (docker-compose up -d)"
echo "2. Ejecutar backend: cd backend && npm run dev"
echo "3. Ejecutar frontend: cd frontend && npm run dev"
echo "4. Abrir http://localhost:3000"
