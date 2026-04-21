## Pruebas de API - Sistema de Autenticación

### Base URL
```
http://localhost:3001/api
```

## 1. Health Check

```bash
GET /health

# Con curl
curl -X GET http://localhost:3001/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 2. Registrar Usuario (Cliente)

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "Cliente"
}

# Con curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "role": "Cliente"
  }'
```

Response:
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "Cliente"
  }
}
```

## 3. Registrar Usuario (Recepción)

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "María García",
  "email": "maria@example.com",
  "password": "password123",
  "role": "Recepción"
}
```

## 4. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}

# Con curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "Sesión iniciada exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "Cliente"
  }
}
```

## 5. Obtener Usuario Actual

```bash
GET /auth/me
Authorization: Bearer <token>

# Con curl
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "roleId": 3,
  "isActive": true,
  "createdAt": "2024-04-21T10:00:00.000Z",
  "updatedAt": "2024-04-21T10:00:00.000Z",
  "role": {
    "id": 3,
    "name": "Cliente",
    "description": "Cliente de la plataforma"
  }
}
```

## 6. Logout

```bash
POST /auth/logout

# Con curl
curl -X POST http://localhost:3001/api/auth/logout
```

Response:
```json
{
  "message": "Sesión cerrada. Por favor, elimine el token del cliente."
}
```

## Casos de Error

### Email ya registrado

```bash
POST /auth/register
{
  "name": "Otro Usuario",
  "email": "juan@example.com",
  "password": "password123"
}
```

Response (409):
```json
{
  "error": "El email ya está registrado"
}
```

### Credenciales inválidas

```bash
POST /auth/login
{
  "email": "juan@example.com",
  "password": "password_incorrecto"
}
```

Response (401):
```json
{
  "error": "Credenciales inválidas"
}
```

### Token no proporcionado

```bash
GET /auth/me
```

Response (401):
```json
{
  "error": "Token no proporcionado"
}
```

### Token inválido o expirado

```bash
GET /auth/me
Authorization: Bearer token_invalido
```

Response (403):
```json
{
  "error": "Token inválido o expirado"
}
```

### Campos requeridos faltantes

```bash
POST /auth/register
{
  "name": "Juan Pérez"
}
```

Response (400):
```json
{
  "error": "nombre, email y contraseña son requeridos"
}
```

## Variables para Postman

Guardar el token en una variable de entorno después de login:

```javascript
// Test script en Postman
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.token);
}
```

Usar en requests subsecuentes:
```
Authorization: Bearer {{token}}
```

## Flujo Completo de Prueba

1. **Registrarse como Cliente**
   - POST /auth/register con rol "Cliente"
   - Guardar el token devuelto

2. **Usar token para obtener datos**
   - GET /auth/me con el token
   - Verificar que devuelve los datos correctos

3. **Intentar con token inválido**
   - GET /auth/me con token falso
   - Debería devolver error 403

4. **Login nuevamente**
   - POST /auth/login
   - Guardar nuevo token

5. **Logout**
   - POST /auth/logout
   - Eliminar token del cliente (en código real)
