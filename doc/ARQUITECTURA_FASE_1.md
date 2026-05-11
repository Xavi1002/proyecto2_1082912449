# Arquitectura — Fase 1: Bootstrap, Login y dataService

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│           UI Layer (React Components)                   │
│  app/page.tsx, app/login/page.tsx, app/dashboard/       │
│  Framer Motion para animaciones                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           API Layer (Next.js Routes)                    │
│  /api/auth/login, /api/auth/me, /api/system/mode        │
│  Request → JWT Verification → Handler                  │
│  Response: JSON + Set-Cookie (HttpOnly)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│      Business Logic Layer (Middleware + Auth)           │
│  withAuth.ts → Verify JWT from Cookie                   │
│  withRole.ts → Check User Role                          │
│  auth.ts → Create/Verify JWT, Hash Password            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│    Unified Data Layer (dataService.ts)                  │
│  ✓ ÚNICO punto de acceso a datos                        │
│  ✓ Maneja Modo Seed vs Modo Live                        │
│  ✓ Operaciones transaccionales                          │
│  ✓ Auditoría integrada                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌────────┐   ┌──────────┐
    │ Seed   │   │Database│   │ Auditoría│
    │Reader  │   │(PG)    │   │ (Blob)   │
    └────────┘   └────────┘   └──────────┘
    data/        Supabase     Vercel Blob
    seed.json
```

## Flujo de Login

```
1. Usuario entra a /login
   ↓
2. Ingresa email + contraseña
   ↓
3. Form submit → POST /api/auth/login
   ↓
4. Validar con Zod (LoginRequestSchema)
   ↓
5. authenticateUser() → dataService.ts
   ├─ Buscar usuario por email (seed o Supabase)
   ├─ Comparar contraseña con hash (verifyPassword)
   └─ Retornar User si coincide
   ↓
6. Crear JWT con createJWT()
   ├─ Payload: { userId, email, role }
   ├─ Firmado con HS256 (JWT_SECRET)
   └─ Expira en 7 días
   ↓
7. Registrar en auditoría (recordAudit)
   ├─ Action: 'login'
   ├─ Entity: 'user'
   └─ Persistir en Blob (si configurado)
   ↓
8. Retornar JSON + Set-Cookie
   ├─ Cookie: hotelmanager_auth=<JWT>
   ├─ HttpOnly: true
   ├─ SameSite: Lax
   └─ Max-Age: 7 days
   ↓
9. Cliente recibe respuesta
   ├─ Cookie se guarda automáticamente
   ├─ Lee user.role del JSON
   └─ Redirige según rol:
      - 'cliente' → /my-reservations
      - 'superadmin', 'recepcionista' → /dashboard
   ↓
10. Usuario autenticado en /dashboard o /my-reservations
```

## Detección de Modo (Seed vs Live)

```
getSystemMode() → 'seed' | 'live'

┌─ Si NEXT_PUBLIC_SUPABASE_URL no configurado
│  └─ Retorna 'seed'
│     └─ dataService usa seedReader
│        └─ getSeedAdmin(), getSeedRooms()
│
└─ Si NEXT_PUBLIC_SUPABASE_URL configurado
   ├─ Intenta query simple a supabase
   ├─ Si éxito → Retorna 'live'
   │  └─ dataService usa supabaseAdmin
   │     └─ Queries directas a Postgres
   └─ Si error → Fallback a 'seed'
      └─ dataService usa seedReader
```

## Estructura de Tablas (Postgres/Supabase)

### users
```sql
id (UUID, PK)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password_hash (TEXT)
role (VARCHAR) — CHECK: 'superadmin', 'recepcionista', 'cliente'
is_active (BOOLEAN)
must_change_password (BOOLEAN)
last_login_at (TIMESTAMPTZ)
created_at (TIMESTAMPTZ)

Índices: idx_users_email
```

### _migrations
```sql
id (SERIAL, PK)
filename (VARCHAR, UNIQUE)
applied_at (TIMESTAMPTZ)

Control de versión de migraciones
```

## Formato de JWT

```json
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "role": "superadmin|recepcionista|cliente",
  "iat": 1715436000,
  "exp": 1716040800
}

Signature:
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  JWT_SECRET
)
```

## Validación de Entrada (Zod Schemas)

```
LoginRequestSchema:
├─ email (string, email format)
└─ password (string, min 6 chars)

CreateUserRequestSchema:
├─ email (string, email format)
├─ name (string, min 3 chars)
└─ role (enum: superadmin|recepcionista|cliente)

ChangePasswordRequestSchema:
├─ current_password (string, min 6)
├─ new_password (string, min 6)
└─ confirm_password (matches new_password)
```

## Auditoría en Vercel Blob

### Estructura
```
blob/audit/YYYYMM.json → Array<AuditEntry>
```

### Entrada de Auditoría
```json
{
  "id": "audit-1715436000000-abc123xyz",
  "timestamp": "2026-05-11T14:30:00.000Z",
  "user_id": "uuid-here",
  "user_email": "admin@hotelmanager.com",
  "user_role": "superadmin",
  "action": "login|logout|create_room|...",
  "entity": "user|room|client|reservation|system",
  "entity_id": "uuid-or-null",
  "summary": "Login exitoso",
  "metadata": { /* opcional */ }
}
```

### Patrón de Implementación
```typescript
// Lazy loading del token
function getBlobToken(): string {
  return process.env.BLOB_READ_WRITE_TOKEN!;
}

// Leer archivo (get del SDK)
const blob = await get(filename, { token });
const entries = JSON.parse(await blob.text());

// Escribir/actualizar (append-only)
entries.push(newEntry);
await put(filename, JSON.stringify(entries), { token });
```

## Tratamiento de Errores

### Error Handling por Tipo

| Error | Status | Manejo |
|-------|--------|--------|
| Email/contraseña incorrecto | 401 | Mensaje genérico |
| Token inválido/expirado | 401 | Redirigir a /login |
| Rol no permitido | 403 | Mensaje "Acceso denegado" |
| Email duplicado | 409 | Error: "El email ya existe" |
| Contraseña incorrecta | 409 | Error: "La contraseña es incorrecta" |
| Validación Zod fallida | 400 | Errores detallados del schema |
| Error interno | 500 | Mensaje genérico sin detalles |

## Variables de Entorno Requeridas

```
# REQUERIDAS para funcionalidad
JWT_SECRET=<min 32 chars>
ADMIN_BOOTSTRAP_SECRET=<secret>

# OPCIONALES (seed mode sin ellas)
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
DATABASE_URL=<url>
BLOB_READ_WRITE_TOKEN=<token>

# INFORMATIVO
NODE_ENV=development|production
```

## Seguridad — Checklist de Fase 1

- ✓ Contraseñas hasheadas con bcryptjs (salt rounds: 10)
- ✓ JWT firmado con HS256 (JWT_SECRET en .env)
- ✓ Cookie HttpOnly, SameSite=Lax
- ✓ Secure flag en producción (NODE_ENV=production)
- ✓ No hay registro público (solo SuperAdmin crea usuarios)
- ✓ No hay recuperación de contraseña sin autenticación
- ✓ Auditoría de login/logout persistida
- ✓ Validación de entrada con Zod
- ✓ CERO CACHÉ en `/api/:path*`
- ✓ dataService es único punto de acceso (previene acceso directo a BD)

## Patrón de Desarrollo para Fases Posteriores

### Agregar Nuevo Recurso (ej: Rooms en Fase 3)

1. **types.ts**: Agregar `interface Room { ... }`
2. **schemas.ts**: Agregar `CreateRoomSchema`, `UpdateRoomSchema`
3. **dataService.ts**:
   ```typescript
   export async function getRooms(filters?: ...): Promise<Room[]>
   export async function getRoomById(id: string): Promise<Room | null>
   export async function createRoom(userId: string, data: ...): Promise<Room>
   export async function updateRoom(id: string, userId: string, data: ...): Promise<Room>
   export async function deleteRoom(id: string, userId: string): Promise<void>
   ```
4. **API Routes**: 
   - `POST /api/rooms` → createRoom (withRole)
   - `GET /api/rooms` → getRooms (withAuth)
   - `PUT /api/rooms/[id]` → updateRoom (withRole)
5. **UI Components**: FormComponent, ListComponent
6. **Pages**: `/rooms`, `/rooms/new`, `/rooms/[id]/edit`

---

Fecha: Mayo 11, 2026
Stack: Next.js 16 + TypeScript 5 + Supabase Postgres + Vercel Blob
