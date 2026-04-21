# Backend - Express + PostgreSQL

API REST del proyecto fullstack con Express.js, TypeScript y PostgreSQL.

## Requisitos

- Node.js 18+
- npm o yarn
- PostgreSQL 12+

## Instalación

```bash
npm install
# o
yarn install
```

## Configuración de Base de Datos

1. Crear base de datos PostgreSQL:
```sql
CREATE DATABASE proyecto2_db;
```

2. Configurar variables de entorno en `.env`:
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

## Desarrollo

```bash
npm run dev
# o
yarn dev
```

El servidor estará disponible en `http://localhost:3001`

## Build y Producción

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Estado del servidor

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Obtener todos
- `GET /api/users/:id` - Obtener por ID
- `POST /api/users` - Crear nuevo
- `PUT /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar

## Sistemas de Autenticación

### JWT (JSON Web Tokens)
El servidor utiliza JWT para autenticar solicitudes. Cada token válido tiene un tiempo de expiración configurable (por defecto 7 días).

### Roles Disponibles
- **SuperAdmin**: Acceso total al sistema
- **Recepción**: Acceso limitado para gestionar recepción
- **Cliente**: Cliente estándar de la plataforma

### Flujo de Autenticación

1. **Registro**: `POST /api/auth/register`
   ```json
   {
     "name": "Juan Pérez",
     "email": "juan@example.com",
     "password": "securePassword123",
     "role": "Cliente"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "juan@example.com",
     "password": "securePassword123"
   }
   ```

3. **Usar Token**: En la cabecera `Authorization`
   ```
   Authorization: Bearer <token_jwt>
   ```

### Middleware de Autenticación
Todas las rutas que requieren token deben incluir el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Estructura

- `src/config` - Configuración de base de datos
- `src/models` - Modelos Sequelize
- `src/controllers` - Controladores de lógica
- `src/routes` - Rutas de la API
- `src/middleware` - Middlewares personalizados
- `src/utils` - Funciones utilitarias
