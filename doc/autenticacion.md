# Sistema de Autenticación con JWT

## Descripción General

Sistema de autenticación completo implementado con JWT (JSON Web Tokens) y roles para controlar acceso.

## Características

- ✅ Registro de nuevos usuarios
- ✅ Login con email y contraseña
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Sistema de roles (SuperAdmin, Recepción, Cliente)
- ✅ Middleware de autorización
- ✅ Almacenamiento seguro de tokens
- ✅ Rutas protegidas en frontend

## Arquitectura

### Backend (Express + Node.js)

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración Sequelize
│   ├── models/
│   │   ├── User.ts              # Modelo de Usuario
│   │   └── Role.ts              # Modelo de Rol
│   ├── controllers/
│   │   └── authController.ts    # Lógica de autenticación
│   ├── routes/
│   │   └── auth.ts              # Rutas de autenticación
│   ├── middleware/
│   │   └── auth.ts              # Middlewares JWT
│   └── utils/
│       ├── password.ts          # Hash de contraseñas
│       └── jwt.ts               # Funciones JWT
```

### Frontend (Next.js + React)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── index.tsx            # Home
│   │   ├── login.tsx            # Página de login
│   │   ├── register.tsx         # Página de registro
│   │   └── profile.tsx          # Perfil (protegido)
│   ├── components/
│   │   ├── NavBar.tsx           # Barra de navegación
│   │   └── ProtectedRoute.tsx   # Componente de rutas protegidas
│   └── lib/
│       ├── api.ts               # Cliente Axios
│       └── useAuth.ts           # Hook de autenticación
```

## Flujo de Autenticación

### 1. Registro

```
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "securePassword123",
  "role": "Cliente"
}

Response:
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

### 2. Login

```
POST /api/auth/login
{
  "email": "juan@example.com",
  "password": "securePassword123"
}

Response:
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

### 3. Usar Token

```
GET /api/auth/me
Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Logout

En el cliente, simplemente eliminar el token de localStorage:
```javascript
localStorage.removeItem('auth_token')
```

## Modelo de Datos

### Tabla: roles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID primario |
| name | ENUM | SuperAdmin, Recepción, Cliente |
| description | STRING | Descripción del rol |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Fecha actualización |

### Tabla: users

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID primario |
| name | STRING | Nombre del usuario |
| email | STRING | Email único |
| password | STRING | Contraseña hasheada |
| roleId | INTEGER | FK a roles |
| isActive | BOOLEAN | Usuario activo |
| createdAt | TIMESTAMP | Fecha creación |
| updatedAt | TIMESTAMP | Fecha actualización |

## Seguridad

### Hash de Contraseñas

- Usando **bcrypt** con 10 salt rounds
- Las contraseñas nunca se devuelven en respuestas
- Comparación segura con bcrypt.compare()

### JWT

- Algoritmo: HS256
- Expiración: 7 días (configurable)
- Secret: Debe cambiarse en producción
- Payload contiene: id, email, roleId, role

### Middleware de Autenticación

```typescript
app.use('/api/ruta-protegida', authenticateToken)
```

Valida que el token sea válido y no esté expirado.

### Middleware de Autorización

```typescript
app.use('/api/ruta-admin', 
  authenticateToken, 
  authorizeRole('SuperAdmin')
)
```

Valida que el usuario tenga el rol requerido.

## Variables de Entorno

### Backend (.env)

```
# JWT
JWT_SECRET=tu-secret-muy-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d
```

En producción, usar un secret fuerte y único.

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Uso en Frontend

### Hook useAuth

```typescript
import { useAuth } from '@/lib/useAuth'

export default function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth()

  const handleLogin = async () => {
    await login('user@example.com', 'password')
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola {user?.name}</p>
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### Proteger Rutas

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="SuperAdmin">
      <h1>Panel Admin</h1>
    </ProtectedRoute>
  )
}
```

## Roles y Permisos

### SuperAdmin
- Acceso total al sistema
- Puede gestionar usuarios y roles
- Puede acceder a todas las rutas protegidas

### Recepción
- Acceso limitado
- Puede gestionar recepciones
- No puede acceder a administración

### Cliente
- Acceso estándar
- Puede ver su perfil
- Puede acceder a servicios públicos

## Prueba del Sistema

### Registrar Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "role": "Cliente"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Usar Token

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <token_aqui>"
```

## Errores Comunes

### Token inválido o expirado
- El token ha expirado (7 días)
- Solución: Login nuevamente para obtener nuevo token

### Email ya registrado
- El email ya existe en la base de datos
- Solución: Usar otro email o login si ya existe la cuenta

### Credenciales inválidas
- Email o contraseña incorrectos
- Solución: Verificar que los datos sean correctos

### No autenticado
- No se proporcionó token en el header
- Solución: Incluir header Authorization con token válido

## Próximos Pasos

1. [ ] Implementar refresh tokens
2. [ ] Agregar 2FA (autenticación de dos factores)
3. [ ] Implementar recuperación de contraseña
4. [ ] Agregar verificación de email
5. [ ] Implementar logout en todas las sesiones
6. [ ] Agregar auditoría de login/logout
