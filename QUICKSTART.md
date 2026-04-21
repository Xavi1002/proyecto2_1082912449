# Guía Rápida de Inicio

## 1️⃣ Clonar el proyecto

```bash
git clone https://github.com/Xavi1002/proyecto2_1082912449.git
cd proyecto2_1082912449
```

## 2️⃣ Iniciar PostgreSQL

### Con Docker (recomendado):
```bash
docker-compose up -d
```

### Sin Docker:
Instalar PostgreSQL localmente y crear la base de datos:
```sql
CREATE DATABASE proyecto2_db;
```

## 3️⃣ Instalar dependencias backend

```bash
cd backend
npm install
```

## 4️⃣ Configurar variables de entorno (backend)

Crear archivo `backend/.env` si no existe:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto2_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 5️⃣ Iniciar backend

```bash
cd backend
npm run dev
```

Debería ver: `✓ Servidor ejecutándose en puerto 3001`

## 6️⃣ Instalar dependencias frontend

En otra terminal:
```bash
cd frontend
npm install
```

## 7️⃣ Iniciar frontend

```bash
cd frontend
npm run dev
```

Debería ver: `- ready started server on 0.0.0.0:3000`

## 8️⃣ Acceder a la aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

## ✅ Verificar que todo funciona

Terminal 1 (Backend):
```
✓ Base de datos conectada
✓ Tablas sincronizadas
✓ Servidor ejecutándose en puerto 3001
```

Terminal 2 (Frontend):
```
- ready started server on 0.0.0.0:3000
```

Terminal 3 (Docker - opcional):
```
Base de datos PostgreSQL running
```

## � Sistema de Autenticación

El proyecto incluye un sistema completo de autenticación con JWT.

### Prueba de Autenticación

1. **Registrarse**: http://localhost:3000/register
2. **Iniciar sesión**: http://localhost:3000/login
3. **Ver perfil**: http://localhost:3000/profile (protegido)

### Roles Disponibles

- **SuperAdmin**: Acceso total
- **Recepción**: Acceso limitado
- **Cliente**: Acceso estándar (predeterminado)

### Endpoints de Autenticación

- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Datos del usuario (requiere token)
- `POST /api/auth/logout` - Cerrar sesión

Ver `doc/autenticacion.md` para documentación completa.

## 📝 Próximos pasos

1. Crear CRUD de habitaciones
2. Implementar sistema de reservas
3. Agregar dashboard/panel de control
4. Mejorar diseño UI/UX
5. Agregar búsqueda de disponibilidad

## 🆘 Solucionar problemas

### Puerto 3001 en uso
```bash
# Cambiar PORT en backend/.env o:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Puerto 3000 en uso
```bash
# Cambiar puerto en frontend o:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error de conexión a BD
- Verificar que PostgreSQL esté corriendo
- Revisar credenciales en `.env`
- Comprobar conexión: `psql -U postgres -d proyecto2_db`

### Limpiar dependencias
```bash
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```
