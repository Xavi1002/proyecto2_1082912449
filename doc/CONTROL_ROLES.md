# Control de Roles - Sistema de Reservas

## Overview

Se ha implementado un sistema completo de control de acceso basado en roles (RBAC) con tres niveles de usuario:

- **SuperAdmin**: Acceso total al sistema
- **Recepción**: Gestión de reservas y habitaciones
- **Cliente**: Visualización de sus propias reservas

## Cambios Implementados

### Backend

#### 1. Middleware de Autenticación Mejorado (`src/middleware/auth.ts`)

Se agregaron nuevos middlewares para validación de permisos granulares:

- `authenticateToken`: Valida el JWT y obtiene los datos del usuario
- `authorizeRole(...roles)`: Valida que el usuario tenga uno de los roles especificados
- `requireRoomManagement`: Verifica si el usuario puede gestionar habitaciones
- `requireUserManagement`: Verifica si el usuario puede gestionar usuarios
- `requireSuperAdmin`: Restringe acceso solo a SuperAdmin

**Ejemplo de uso:**

```typescript
// Solo SuperAdmin
router.get('/users', authenticateToken, requireSuperAdmin, getUsers)

// SuperAdmin o Recepción
router.post('/reservations', authenticateToken, authorizeRole(RoleType.SUPERADMIN, RoleType.RECEPCION), updateReservation)

// Basado en permisos
router.post('/rooms', authenticateToken, requireRoomManagement, createRoom)
```

#### 2. Utilidades de Permisos (`src/utils/permissions.ts`)

Funciones de validación de permisos específicos:

```typescript
export const PERMISSIONS = {
  SUPERADMIN: {
    canManageRooms: true,
    canManageReservations: true,
    canManageUsers: true,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    canAccessAdminPanel: true,
  },
  RECEPCION: {
    canManageRooms: true,
    canManageReservations: true,
    canManageUsers: false,
    canViewAllReservations: true,
    canEditAllReservations: true,
    canDeleteAllReservations: true,
    canAccessAdminPanel: false,
  },
  CLIENTE: {
    canManageRooms: false,
    canManageReservations: false,
    canManageUsers: false,
    canViewAllReservations: false,
    canEditAllReservations: false,
    canDeleteAllReservations: false,
    canAccessAdminPanel: false,
  },
}
```

#### 3. Protección de Rutas

**Usuarios** (`src/routes/users.ts`):
- `GET /users` - Solo SuperAdmin
- `POST /users` - Solo SuperAdmin
- `PUT /users/:id` - Solo SuperAdmin
- `DELETE /users/:id` - Solo SuperAdmin
- `GET /users/search` - Autenticado (búsqueda de clientes)

**Habitaciones** (`src/routes/rooms.ts`):
- `POST /rooms` - SuperAdmin o Recepción
- `PUT /rooms/:id` - SuperAdmin o Recepción
- `DELETE /rooms/:id` - SuperAdmin o Recepción
- `PATCH /rooms/:id/status` - SuperAdmin o Recepción
- Lectura - Público

**Reservas** (`src/routes/reservations.ts`):
- `GET /reservations` - Solo SuperAdmin o Recepción (todas las reservas)
- `GET /reservations/my-reservations` - Autenticado (solo sus reservas)
- `POST /reservations` - Autenticado (crear reserva)
- `PUT /reservations/:id` - SuperAdmin o Recepción
- `DELETE /reservations/:id` - Propietario o Recepción/SuperAdmin

#### 4. Controladores Mejorados

Los controladores ahora validan permisos dentro de las funciones:

```typescript
export const updateReservation = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const userRole = req.user?.role as RoleType

  // Validar permisos
  if (!canEditReservation(userRole, userId, reservation.userId)) {
    return res.status(403).json({
      error: 'No tiene permiso para actualizar esta reserva',
    })
  }
  
  // Continuar con la operación...
}
```

### Frontend

#### 1. Componente RoleBasedAccess Mejorado

```typescript
// Mostrar contenido solo para ciertos roles
<RoleBasedAccess allowedRoles={['SuperAdmin', 'Recepción']}>
  <AdminPanel />
</RoleBasedAccess>

// Con fallback
<RoleBasedAccess 
  allowedRoles={['SuperAdmin']} 
  fallback={<p>No autorizado</p>}
>
  <SuperAdminOnly />
</RoleBasedAccess>
```

#### 2. Hooks de Permisos

**`useHasRole()`**: Verifica si el usuario tiene un rol específico

```typescript
const isSuperAdmin = useHasRole('SuperAdmin')
const isStaff = useHasRole(['SuperAdmin', 'Recepción'])

if (!isSuperAdmin) {
  return <AccessDenied />
}
```

**`useRolePermissions()`**: Obtiene los permisos del usuario

```typescript
const permissions = useRolePermissions()

if (permissions.canManageUsers) {
  // Mostrar opción de gestión de usuarios
}

console.log(permissions.isSuperAdmin) // true/false
console.log(permissions.isReception) // true/false
console.log(permissions.isClient) // true/false
```

#### 3. NavBar Dinámico

El NavBar ahora muestra opciones diferentes según el rol:

**SuperAdmin**:
- Dashboard
- Gestionar Usuarios
- Gestionar Habitaciones
- Todas las Reservas
- Perfil

**Recepción**:
- Dashboard
- Habitaciones
- Reservas
- Buscador Clientes
- Perfil

**Cliente**:
- Dashboard
- Buscar Habitaciones
- Mis Reservas
- Perfil

#### 4. Página de Gestión de Usuarios

Nueva página `/pages/users.tsx` para SuperAdmin:
- Listar todos los usuarios
- Editar roles de usuarios
- Activar/desactivar usuarios
- Eliminar usuarios
- Cambiar información de usuario

#### 5. Página de Reservas Mejorada

La página `/pages/reservations.tsx` ahora muestra:

**Para SuperAdmin/Recepción**:
- Estadísticas completas del hotel
- Todas las reservas
- Opciones de edición

**Para Cliente**:
- Solo sus reservas
- Botón para crear nuevas reservas

## Flujo de Autorización

### 1. Registro

El usuario registrado tiene un rol por defecto (Cliente)

```
POST /auth/register
{
  "name": "Juan",
  "email": "juan@example.com",
  "password": "password123",
  "role": "Cliente" // Por defecto
}
```

### 2. Login

Se genera un JWT con el rol del usuario

```
POST /auth/login
Response: { token, user: { id, name, email, role } }
```

### 3. Peticiones Protegidas

Cada petición debe incluir el token en el header:

```
Authorization: Bearer <token>
```

El middleware extrae el rol del token y valida permisos.

### 4. Respuestas

**Autorizado**:
```
200 OK
{ data... }
```

**No autenticado**:
```
401 Unauthorized
{ error: 'Token no proporcionado' }
```

**Sin permisos**:
```
403 Forbidden
{ error: 'No tiene permiso...' }
```

## Casos de Uso

### SuperAdmin

```
✓ Crear, leer, actualizar, eliminar usuarios
✓ Crear, leer, actualizar, eliminar habitaciones
✓ Ver todas las reservas
✓ Editar/cancelar cualquier reserva
✓ Acceso al panel administrativo completo
```

### Recepción

```
✓ Crear, actualizar, eliminar habitaciones
✓ Ver todas las reservas del hotel
✓ Crear nuevas reservas para clientes
✓ Editar/cancelar reservas
✗ No puede gestionar usuarios
✗ No puede acceder a panel administrativo
```

### Cliente

```
✓ Ver sus propias reservas
✓ Crear nuevas reservas
✓ Editar sus datos de perfil
✗ No puede ver reservas de otros
✗ No puede gestionar habitaciones
✗ No puede gestionar usuarios
```

## Testing de Permisos

### 1. Crear usuario SuperAdmin

```bash
# Registrar como cliente
POST /auth/register
{ name: "Admin", email: "admin@hotel.com", password: "admin123" }

# Luego cambiar rol manualmente en BD o usando endpoint de actualización
PUT /users/{id}
{ roleId: 1 } // 1 = SuperAdmin
```

### 2. Probar acceso a usuarios

```bash
# Como Cliente - Debe fallar (403)
GET /users
Authorization: Bearer <client-token>

# Como SuperAdmin - Debe funcionar (200)
GET /users
Authorization: Bearer <admin-token>
```

### 3. Probar visualización de reservas

```bash
# Como Cliente - Solo sus reservas
GET /reservations/my-reservations
Authorization: Bearer <client-token>

# Como Recepción - Todas las reservas
GET /reservations
Authorization: Bearer <reception-token>
```

## Seguridad

- Tokens JWT con expiración
- Contraseñas hasheadas con bcrypt
- Validación de permisos en backend (nunca confiar solo en frontend)
- Errores genéricos para no revelar información
- Validación de roles en cada endpoint sensible

## Próximas Mejoras

- [ ] Implementar roles personalizados
- [ ] Sistema de permisos más granular
- [ ] Auditoría de acciones
- [ ] 2FA para SuperAdmin
- [ ] Restricción por IP
- [ ] Rate limiting en endpoints sensibles
