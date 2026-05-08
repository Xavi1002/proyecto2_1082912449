# Control de Roles - Referencia Rápida 🚀

## 3 Roles Principales

| Rol | Acceso |
|-----|--------|
| **SuperAdmin** 🔴 | ✓ Todo (usuarios, habitaciones, reservas) |
| **Recepción** 🔵 | ✓ Habitaciones, reservas, buscador clientes |
| **Cliente** 🟢 | ✓ Solo sus propias reservas |

---

## Endpoints Protegidos

### 👥 Usuarios (SuperAdmin solo)
```
GET    /users                      → 200 (lista todos)
GET    /users/:id                  → 200
GET    /users/search?name=Juan     → 200 (cualquiera)
POST   /users                      → 201 (crear)
PUT    /users/:id                  → 200 (editar)
DELETE /users/:id                  → 200 (eliminar)
```

### 🏨 Habitaciones (Staff)
```
GET    /rooms                      → 200 (público)
POST   /rooms                      → 201 (SuperAdmin, Recepción)
PUT    /rooms/:id                  → 200 (SuperAdmin, Recepción)
DELETE /rooms/:id                  → 200 (SuperAdmin, Recepción)
```

### 📅 Reservas (Mixto)
```
GET    /reservations               → 200 (SuperAdmin, Recepción)
GET    /reservations/my-reservations → 200 (autenticado)
GET    /reservations/:id           → 200 (propietario o staff)
POST   /reservations               → 201 (autenticado)
PUT    /reservations/:id           → 200 (SuperAdmin, Recepción)
DELETE /reservations/:id           → 200 (propietario o staff)
```

---

## Frontend - Componentes

### Mostrar contenido por rol
```typescript
import RoleBasedAccess from '@/components/RoleBasedAccess'

// Opción 1: Solo SuperAdmin
<RoleBasedAccess allowedRoles={['SuperAdmin']}>
  <AdminPanel />
</RoleBasedAccess>

// Opción 2: SuperAdmin o Recepción
<RoleBasedAccess allowedRoles={['SuperAdmin', 'Recepción']}>
  <StaffPanel />
</RoleBasedAccess>

// Opción 3: Con fallback
<RoleBasedAccess 
  allowedRoles={['SuperAdmin']} 
  fallback={<p>Acceso denegado</p>}
>
  <SecretStuff />
</RoleBasedAccess>
```

### Hooks para verificar permisos
```typescript
import { useHasRole, useRolePermissions } from '@/components/RoleBasedAccess'

// Verificar un rol
const isSuperAdmin = useHasRole('SuperAdmin')
const isStaff = useHasRole(['SuperAdmin', 'Recepción'])

// Obtener todos los permisos
const perms = useRolePermissions()
perms.canManageUsers        // boolean
perms.canManageRooms        // boolean
perms.canViewAllReservations // boolean
perms.isSuperAdmin          // boolean
perms.isReception           // boolean
perms.isClient              // boolean
```

---

## Códigos de Error

| Código | Mensaje | Solución |
|--------|---------|----------|
| 401 | Token no proporcionado | Enviar JWT en header |
| 403 | Token inválido | Re-login |
| 403 | No tiene permiso | Rol no autorizado |
| 404 | Recurso no encontrado | Verificar ID |
| 409 | Email ya registrado | Usar otro email |

---

## Headers Requeridos

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Ejemplo: Obtener todas las reservas como Recepción

```bash
# 1. Login como Recepción
POST http://localhost:3000/auth/login
{
  "email": "recepcion@hotel.com",
  "password": "password123"
}
→ { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

# 2. Usar token para obtener reservas
GET http://localhost:3000/reservations
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
→ { count: 5, reservations: [...] }
```

---

## Página de Usuarios

**URL**: `/users` (Solo SuperAdmin)

**Funciones**:
- Ver lista de todos los usuarios
- Editar nombre, email, rol
- Cambiar estado (Activo/Inactivo)
- Eliminar usuario
- Ver fechas de creación

---

## NavBar Dinámico

**SuperAdmin**: Dashboard • Usuarios • Habitaciones • Reservas • Perfil

**Recepción**: Dashboard • Habitaciones • Reservas • Buscador • Perfil

**Cliente**: Dashboard • Buscar • Mis Reservas • Perfil

---

## Testing Rápido

### ✅ Todo funciona si:
1. SuperAdmin puede crear usuario → 201
2. Cliente intenta → 403
3. Recepción ve todas las reservas → 200
4. Cliente solo ve sus reservas → 200 (filtrado)
5. NavBar muestra opciones según rol

### ❌ Problemas comunes:
- Token expirado → Re-login
- Rol incorrecto en BD → UPDATE users SET roleId=1
- Headers sin Authorization → Agregar header
- Typo en role name → Usar 'SuperAdmin', 'Recepción', 'Cliente'

---

## Cambiar rol de usuario (BD)

```sql
-- Cambiar a SuperAdmin (roleId=1)
UPDATE users SET roleId = 1 WHERE email = 'user@email.com';

-- Cambiar a Recepción (roleId=2)
UPDATE users SET roleId = 2 WHERE email = 'user@email.com';

-- Cambiar a Cliente (roleId=3)
UPDATE users SET roleId = 3 WHERE email = 'user@email.com';
```

---

## Stack Técnico

| Componente | Tecnología |
|-----------|-----------|
| Autenticación | JWT (tokens) |
| Haseo de contraseña | bcrypt |
| Base de datos | PostgreSQL + Sequelize |
| Backend | Node.js + Express |
| Frontend | Next.js + React |
| Validación | TypeScript |

---

## Documentación Completa

Ver: [CONTROL_ROLES.md](./CONTROL_ROLES.md)
