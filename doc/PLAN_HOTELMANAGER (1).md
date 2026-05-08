# HotelManager Pro — Plan Maestro del Sistema
> Sistema de Gestión Hotelera | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Xavi Jiménez | Doc: 1082912449

---

## Nota sobre el stack

El documento de planificación original describe un backend Node.js + Express separado con deploy en Render/Railway. Este plan unifica todo bajo el **stack estándar del curso**: Next.js App Router (que actúa como servidor a través de API Routes), Supabase Postgres y Vercel (deploy). Esta arquitectura elimina la necesidad de mantener dos proyectos distintos y simplifica el deploy a un solo servicio.

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Actores del sistema](#2-actores-del-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Casos de uso](#4-casos-de-uso)
5. [Requerimientos funcionales](#5-requerimientos-funcionales)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Stack tecnológico](#7-stack-tecnológico)
8. [Arquitectura de persistencia](#8-arquitectura-de-persistencia)
9. [Bootstrap y migrations](#9-bootstrap-y-migrations)
10. [Capa de datos unificada (dataService)](#10-capa-de-datos-unificada)
11. [Modelo de datos — Supabase Postgres](#11-modelo-de-datos--supabase-postgres)
12. [Auditoría en Vercel Blob](#12-auditoría-en-vercel-blob)
13. [Arquitectura de rutas](#13-arquitectura-de-rutas)
14. [Requerimientos no funcionales](#14-requerimientos-no-funcionales)
15. [Flujos de usuario y de trabajo](#15-flujos-de-usuario-y-de-trabajo)
16. [Diseño de interfaz](#16-diseño-de-interfaz)
17. [Plan de fases de implementación](#17-plan-de-fases-de-implementación)
18. [Restricciones del sistema](#18-restricciones-del-sistema)
19. [Glosario](#19-glosario)

---

## 1. Definición del sistema

**HotelManager Pro** es una aplicación web de gestión hotelera que digitaliza y centraliza las operaciones de un hotel mediano. Permite administrar habitaciones (con sus tipos y estados), registrar y consultar clientes, gestionar reservas con validación de disponibilidad, y ofrecer un dashboard con el estado de ocupación en tiempo real.

El sistema distingue tres tipos de usuario: el SuperAdmin con control total, el Recepcionista que opera el día a día (reservas y clientes), y el Cliente (huésped) que solo puede ver sus propias reservas desde un portal de autoservicio.

---

## 2. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **SuperAdmin** | Interno | Control total del sistema. CRUD de habitaciones, usuarios y configuración. |
| **Recepcionista** | Interno | Gestiona reservas y clientes. No puede eliminar habitaciones ni modificar roles. |
| **Cliente** | Externo | Huésped del hotel con acceso al portal para ver sus propias reservas. |
| **Sistema** | No humano | Cambia el estado de habitaciones automáticamente al crear o cancelar reservas. Valida solapamiento de fechas. |

> No hay registro público autoservicio. Los Clientes y Recepcionistas los crea el SuperAdmin.

---

## 3. Roles y permisos

| Recurso / Acción | Cliente | Recepcionista | SuperAdmin |
|---|:-:|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ❌ | ✅ |
| **HABITACIONES** | | | |
| Ver listado con filtros | ❌ | ✅ | ✅ |
| Crear / editar habitación | ❌ | ❌ | ✅ |
| Eliminar habitación | ❌ | ❌ | ✅ |
| Cambiar estado (mantenimiento) | ❌ | ✅ | ✅ |
| **CLIENTES** | | | |
| Ver sus propios datos | ✅ | ✅ | ✅ |
| Ver todos los clientes | ❌ | ✅ | ✅ |
| Crear / editar clientes | ❌ | ✅ | ✅ |
| Eliminar clientes | ❌ | ❌ | ✅ |
| **RESERVAS** | | | |
| Ver sus propias reservas | ✅ | ✅ | ✅ |
| Ver todas las reservas | ❌ | ✅ | ✅ |
| Crear reserva | ❌ | ✅ | ✅ |
| Cancelar reserva | ❌ | ✅ | ✅ |
| **DASHBOARD** | | | |
| Ver KPIs de ocupación | ❌ | ✅ | ✅ |
| **USUARIOS** | | | |
| Crear / editar / suspender usuarios | ❌ | ❌ | ✅ |
| **AUDITORÍA** | | | |
| Ver bitácora de operaciones | ❌ | ❌ | ✅ |

---

## 4. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Correo y contraseña. JWT con cookie HttpOnly. Redirige según el rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Verifica contraseña actual. |

### Módulo de Habitaciones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Ver habitaciones | Recepcionista / SuperAdmin | Listado con filtros por estado y tipo. Muestra disponibles, ocupadas y en mantenimiento. |
| CU-02 | Crear habitación | SuperAdmin | Número único, tipo (simple/doble/suite), estado y precio por noche. |
| CU-03 | Editar habitación | SuperAdmin | Modifica cualquier campo. |
| CU-04 | Eliminar habitación | SuperAdmin | Solo si no tiene reservas activas (pendientes u ocupadas). Flujo alternativo: si tiene reservas activas → 409. |

### Módulo de Clientes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-05 | Registrar cliente | Recepcionista / SuperAdmin | Nombre, correo, teléfono y número de documento. Email y documento únicos. |
| CU-06 | Buscar cliente | Recepcionista / SuperAdmin | Por nombre o documento. Resultados en tiempo real con debounce. |
| CU-07 | Ver perfil de cliente | Recepcionista / SuperAdmin / Cliente | Datos del cliente y su historial de reservas. |

### Módulo de Reservas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-08 | Crear reserva | Recepcionista / SuperAdmin | Selecciona cliente, habitación y fechas. El sistema valida disponibilidad (sin solapamiento). Crea la reserva y cambia la habitación a "ocupada". |
| CU-09 | Ver todas las reservas | Recepcionista / SuperAdmin | Listado con filtros por estado, fecha y habitación. |
| CU-10 | Ver mis reservas | Cliente | El cliente autenticado ve solo sus propias reservas. |
| CU-11 | Cancelar reserva | Recepcionista / SuperAdmin | Cambia el estado a "cancelada" y la habitación a "disponible". |

### Dashboard

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-12 | Ver dashboard | Recepcionista / SuperAdmin | KPIs: disponibles, ocupadas, en mantenimiento, reservas activas del día. |

---

## 5. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del SuperAdmin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite login con correo y contraseña para los tres roles. |
| RF-02 | El sistema genera un JWT al autenticarse y redirige al panel correspondiente según el rol. |
| RF-03 | El SuperAdmin puede crear, editar y eliminar habitaciones con tipo, estado y precio. |
| RF-04 | El sistema permite crear reservas seleccionando cliente, habitación y fechas. |
| RF-05 | El sistema valida la disponibilidad de la habitación antes de confirmar la reserva. |
| RF-06 | El recepcionista puede registrar y editar información de clientes. |
| RF-07 | El dashboard muestra en tiempo real las habitaciones disponibles, ocupadas y en mantenimiento. |
| RF-08 | El sistema permite buscar clientes por nombre o número de documento. |
| RF-09 | Los usuarios pueden ver el historial de reservas asociadas a un cliente. |
| RF-10 | El sistema controla el acceso a funcionalidades según el rol del usuario autenticado. |
| RF-11 | El cliente autenticado puede ver únicamente sus propias reservas desde el portal. |

---

## 6. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Sin autenticación: sin acceso a datos ni operaciones. | `withAuth` en todos los endpoints privados. |
| RN-02 | Una habitación no puede tener dos reservas activas con fechas solapadas. | Query de solapamiento antes de insertar: `check_in < req.check_out AND check_out > req.check_in`. Retornar 409 si hay conflicto. |
| RN-03 | Solo el SuperAdmin puede crear, editar o eliminar habitaciones y usuarios. | `withRole(['superadmin'])` en los endpoints correspondientes. |
| RN-04 | Al confirmar una reserva, la habitación cambia automáticamente a "ocupada". Al cancelarla, vuelve a "disponible". | Operación secuencial en el servidor: INSERT reserva + UPDATE habitación, dentro de la misma secuencia. |
| RN-05 | El correo y el número de documento de un cliente deben ser únicos. | UNIQUE en `clients.email` y `clients.identification_number`. Capturar error de Postgres y retornar 409. |
| RN-06 | El recepcionista puede gestionar reservas y clientes, pero no habitaciones ni roles. | `withRole(['superadmin'])` en endpoints de habitaciones y usuarios. |
| RN-07 | Un cliente solo puede ver sus propias reservas. | Query filtra por `reservations.client_user_id = JWT.userId`. |
| RN-08 | Una habitación no puede eliminarse si tiene reservas activas. | Verificar COUNT antes de eliminar. Si > 0: retornar 409. |
| RN-09 | El precio por noche se captura como snapshot en la reserva al momento de crearla. | Campo `price_per_night_snapshot` en `reservations`. |

---

## 7. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only |
| Iconos | Lucide React | — | Iconografía |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 8. Arquitectura de persistencia

### 8.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, habitaciones, clientes, reservas. | SQL necesario: validación de solapamiento, filtros de disponibilidad, historial por cliente. |
| **Vercel Blob** | Auditoría (`audit/<YYYYMM>.json`). | Logs append-only. |
| **`data/` en el repo** | Seed: SuperAdmin + habitaciones demo. | Read-only. Solo para arrancar. |

### 8.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **La verificación de solapamiento y la creación de la reserva son una secuencia atómica** en el servidor.
3. **El cambio de estado de la habitación ocurre dentro de la misma operación** que crea o cancela la reserva.
4. **`price_per_night_snapshot`** preserva el precio al momento de reservar.
5. **CERO caché** en `/api/:path*`. Headers `no-store`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "HotelManager Pro" }
  seed.json       ← {
                      "users": [{
                        email: "admin@hotelmanager.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Super Administrador",
                        role: "superadmin"
                      }],
                      "rooms": [
                        { "room_number": "101", "type": "simple",  "status": "disponible", "price_per_night": 120000 },
                        { "room_number": "102", "type": "simple",  "status": "disponible", "price_per_night": 120000 },
                        { "room_number": "201", "type": "doble",   "status": "disponible", "price_per_night": 200000 },
                        { "room_number": "301", "type": "suite",   "status": "disponible", "price_per_night": 380000 }
                      ]
                    }
  README.md
```

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql        ← Fase 1: users + _migrations
  0002_init_rooms.sql        ← Fase 3: rooms
  0003_init_clients.sql      ← Fase 4: clients
  0004_init_reservations.sql ← Fase 5: reservations
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos**.

### 10.1 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Habitaciones
export async function getRooms(filters?: RoomFilters): Promise<Room[]>
export async function getRoomById(id: string): Promise<Room | null>
export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room>
export async function updateRoom(id: string, userId: string, data: UpdateRoomRequest): Promise<Room>
export async function deleteRoom(id: string, userId: string): Promise<void>
export async function getAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]>

// Clientes
export async function getClients(query?: string): Promise<Client[]>
export async function getClientById(id: string): Promise<ClientWithReservations | null>
export async function createClient(userId: string, data: CreateClientRequest): Promise<Client>
export async function updateClient(id: string, userId: string, data: UpdateClientRequest): Promise<Client>
export async function deleteClient(id: string, userId: string): Promise<void>

// Reservas
export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation>
export async function getReservations(filters?: ReservationFilters): Promise<ReservationWithDetails[]>
export async function getMyReservations(clientUserId: string): Promise<ReservationWithDetails[]>
export async function cancelReservation(id: string, userId: string): Promise<Reservation>

// Dashboard
export async function getDashboardData(): Promise<DashboardData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 10.2 Lógica crítica: `createReservation`

```typescript
export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation> {
  const { roomId, clientId, checkIn, checkOut } = data;

  // 1. Verificar habitación disponible (RN-02, RN-04)
  const room = await getRoomById(roomId);
  if (!room || room.status !== 'disponible') {
    throw new ConflictError('La habitación no está disponible');
  }

  // 2. Verificar solapamiento de fechas (RN-02)
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('status', 'activa')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (count > 0) {
    throw new ConflictError(`La habitación no está disponible del ${checkIn} al ${checkOut}`);
  }

  // 3. Calcular noches y total con snapshot del precio (RN-09)
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  const total = nights * room.price_per_night;

  // 4. Crear reserva con snapshot del precio
  const { data: reservation } = await supabase.from('reservations').insert({
    room_id: roomId,
    client_id: clientId,
    check_in: checkIn,
    check_out: checkOut,
    price_per_night_snapshot: room.price_per_night,
    total_amount: total,
    status: 'activa',
    created_by: userId,
  }).select().single();

  // 5. Cambiar habitación a "ocupada" (RN-04)
  await supabase.from('rooms').update({ status: 'ocupada' }).eq('id', roomId);

  await recordAudit({ action: 'create_reservation', ... });
  return reservation;
}
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(120) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL DEFAULT 'recepcionista'
                       CHECK (role IN ('superadmin', 'recepcionista', 'cliente')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_rooms.sql`

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number     VARCHAR(10)   NOT NULL UNIQUE,
  type            VARCHAR(10)   NOT NULL
                  CHECK (type IN ('simple', 'doble', 'suite')),
  status          VARCHAR(15)   NOT NULL DEFAULT 'disponible'
                  CHECK (status IN ('disponible', 'ocupada', 'mantenimiento')),
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  description     TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
```

### Migration `0003_init_clients.sql`

```sql
-- El cliente puede tener un usuario del sistema (para acceder al portal)
-- o puede ser solo un registro de cliente sin cuenta digital
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID         REFERENCES users(id) ON DELETE SET NULL,
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(120) UNIQUE NOT NULL,        -- RN-05
  phone                 VARCHAR(20),
  identification_number VARCHAR(30)  UNIQUE NOT NULL,        -- RN-05
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email   ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_id_num  ON clients(identification_number);
```

### Migration `0004_init_reservations.sql`

```sql
CREATE TABLE IF NOT EXISTS reservations (
  id                      UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id                 UUID          NOT NULL REFERENCES rooms(id),
  client_id               UUID          NOT NULL REFERENCES clients(id),
  check_in                DATE          NOT NULL,
  check_out               DATE          NOT NULL,
  price_per_night_snapshot DECIMAL(10,2) NOT NULL,   -- RN-09
  total_amount            DECIMAL(12,2) NOT NULL,
  status                  VARCHAR(15)   NOT NULL DEFAULT 'activa'
                          CHECK (status IN ('activa', 'completada', 'cancelada')),
  created_by              UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by            UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ   DEFAULT NOW(),
  CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_res_room_dates ON reservations(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_res_client     ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_res_status     ON reservations(status);
```

---

## 12. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'superadmin' | 'recepcionista' | 'cliente';
  action:
    | 'login' | 'logout'
    | 'create_room' | 'update_room' | 'delete_room' | 'change_room_status'
    | 'create_client' | 'update_client' | 'delete_client'
    | 'create_reservation' | 'cancel_reservation'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'room' | 'client' | 'reservation' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

---

## 13. Arquitectura de rutas

```
app/
  layout.tsx
  page.tsx                         ← Redirige a /dashboard o /login
  login/page.tsx                   ← Sin link de registro
  dashboard/page.tsx               ← KPIs + habitaciones del día
  rooms/
    page.tsx                       ← Listado con filtros (Recepción/SuperAdmin)
    new/page.tsx                   ← Crear habitación (SuperAdmin)
    [id]/page.tsx                  ← Detalle con reservas
    [id]/edit/page.tsx             ← Editar (SuperAdmin)
  clients/
    page.tsx                       ← Listado + búsqueda en tiempo real
    new/page.tsx                   ← Registrar cliente + opcional cuenta digital
    [id]/page.tsx                  ← Perfil con historial de reservas
    [id]/edit/page.tsx             ← Editar cliente
  reservations/
    page.tsx                       ← Listado con filtros
    new/page.tsx                   ← Nueva reserva
  my-reservations/page.tsx         ← Portal del cliente (solo sus reservas)
  profile/page.tsx                 ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    rooms/
      route.ts                     ← GET | POST (superadmin)
      [id]/route.ts                ← GET | PUT | DELETE (superadmin)
      [id]/status/route.ts         ← PATCH estado (recepcionista + superadmin)
      available/route.ts           ← GET disponibles por fechas
    clients/
      route.ts                     ← GET | POST
      search/route.ts              ← GET búsqueda debounce
      [id]/route.ts                ← GET | PUT | DELETE (superadmin)
    reservations/
      route.ts                     ← GET todas | POST crear
      my/route.ts                  ← GET solo del cliente autenticado
      [id]/route.ts                ← GET detalle
      [id]/cancel/route.ts         ← POST cancelar
    dashboard/route.ts
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                          ← AppLayout, Sidebar (por rol), SeedModeBanner
  rooms/                           ← RoomCard, RoomStatusBadge, RoomForm
  clients/                         ← ClientSearchInput, ClientForm, ClientCard
  reservations/                    ← ReservationForm, ReservationCard,
                                      DateRangePicker, AvailabilityCheck
  dashboard/                       ← KpiCard, RoomsSummary, ReservationsToday
  admin/                           ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 14. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La verificación de disponibilidad y creación de reserva deben completarse en menos de 1 segundo. |
| RNF-02 | La búsqueda de clientes con debounce debe mostrar resultados en menos de 500ms. |
| RNF-03 | El cliente autenticado nunca puede ver datos de otros clientes ni otras reservas. |
| RNF-04 | La interfaz debe funcionar correctamente en celulares y tablets. |
| RNF-05 | Las contraseñas se hashean con bcrypt. |
| RNF-06 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-07 | Los precios se muestran en formato COP (`$XXX.XXX`) en toda la interfaz. |

---

## 15. Flujos de usuario y de trabajo

### Flujo de creación de reserva

| Paso | Actor | Acción |
|---|---|---|
| 1 | Recepcionista | Va a /reservations/new. |
| 2 | Recepcionista | Busca el cliente con `ClientSearchInput` (debounce 300ms). |
| 3 | Recepcionista | Elige las fechas de entrada y salida. El sistema filtra solo las habitaciones disponibles para ese rango. |
| 4 | Recepcionista | Selecciona la habitación. Ve el precio y el total calculado (noches × precio). |
| 5 | Recepcionista | Confirma. El servidor: verifica solapamiento → crea reserva con snapshot → cambia habitación a "ocupada". |
| 6 | Sistema | Toast de confirmación. El dashboard se actualiza. |

### Flujo del portal del cliente

| Paso | Actor | Acción |
|---|---|---|
| 1 | Cliente | Inicia sesión con credenciales entregadas por recepción. |
| 2 | Sistema | Detecta role='cliente' → redirige a /my-reservations. |
| 3 | Cliente | Ve sus reservas (activas, completadas, canceladas). |
| 4 | Cliente | Intenta navegar a /rooms → middleware redirige a /my-reservations. |

---

## 16. Diseño de interfaz

### Identidad visual del Login

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla dividida: panel izquierdo con gradiente azul oscuro + datos del hotel, formulario a la derecha. |
| **Panel izquierdo** | Gradiente `from-slate-800 to-blue-800`. Texto blanco con "HotelManager Pro". Ícono de hotel. |
| **Tarjeta formulario** | Fondo blanco, `border-radius: 12px`, borde superior de 4px en azul (`#1D4ED8`). |
| **Logo** | SVG de edificio de hotel con llave cruzada, en azul (`#1D4ED8`), 48px. |
| **Nombre** | "HotelManager Pro" en Inter Bold 26px, azul oscuro (`#1E3A5F`). |
| **Botón** | bg `#1D4ED8`, texto blanco, hover `#1E40AF`. |
| **Animación** | Framer Motion: `opacity: 0→1`, `x: 20→0`, 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (azul) | `#1D4ED8` |
| Primario oscuro | `#1E40AF` |
| Primario claro | `#DBEAFE` |
| Fondo principal | `#F8FAFC` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#0F172A` |
| Texto secundario | `#64748B` |
| **Disponible** | `#16A34A` + fondo `#F0FDF4` |
| **Ocupada** | `#DC2626` + fondo `#FEF2F2` |
| **Mantenimiento** | `#D97706` + fondo `#FFFBEB` |
| **Reserva activa** | `#1D4ED8` + fondo `#DBEAFE` |
| **Reserva cancelada** | `#DC2626` + fondo `#FEF2F2` |
| Bordes | `#E2E8F0` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

---

## 17. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con SuperAdmin y 4 habitaciones demo. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.8 | Crear `next.config.ts` con headers `no-store`. |
| 1.9 | API Routes: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.10 | Crear `app/login/page.tsx` con la identidad visual de HotelManager Pro: layout dividido, panel azul oscuro, formulario limpio. Sin link de registro. |
| 1.11 | `npm run typecheck` sin errores. Probar: login SuperAdmin del seed → cookie → modo seed. |

---

### Fase 2 — Dashboard, Layout y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS paleta azul en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar dinámico por rol. SuperAdmin: todo. Recepcionista: Dashboard, Habitaciones, Clientes, Reservas, Perfil. Cliente: solo Mis Reservas y Perfil. |
| 2.4 | Crear `/admin/db-setup/page.tsx` con diagnóstico y bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `middleware.ts`: cliente solo puede acceder a `/my-reservations` y `/profile` — cualquier otra ruta privada → redirect silencioso. |
| 2.7 | Crear `GET /api/dashboard`: KPIs de habitaciones y reservas del día. En modo seed: estructura vacía con datos de demo. |
| 2.8 | Crear `app/dashboard/page.tsx`: 4 `KpiCard` + listado de reservas del día. |
| 2.9 | Crear `app/my-reservations/page.tsx` (Cliente): placeholder con empty state. |
| 2.10 | Probar: bootstrap → 4 habitaciones demo en Supabase → tres roles con dashboards distintos. |

---

### Fase 3 — Gestión de Habitaciones
> Rol: Ingeniero Fullstack — CRUD de habitaciones con control de acceso

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_rooms.sql`. Aplicar desde `/admin/db-setup`. El bootstrap inserta las 4 habitaciones demo. |
| 3.2 | Agregar tipos `Room`, `CreateRoomRequest`, `UpdateRoomRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getRooms` (con filtros), `getRoomById`, `createRoom`, `updateRoom`, `deleteRoom` (verifica RN-08 antes), `getAvailableRooms`. |
| 3.4 | API Routes: `GET/POST /api/rooms` (POST solo superadmin), `GET/PUT/DELETE /api/rooms/[id]` (PUT/DELETE solo superadmin), `PATCH /api/rooms/[id]/status`, `GET /api/rooms/available?checkIn=&checkOut=`. |
| 3.5 | Crear `app/rooms/page.tsx`: cuadrícula de `RoomCard` con filtros por tipo y estado. Botón "Nueva habitación" solo visible para SuperAdmin. |
| 3.6 | Crear `app/rooms/new/page.tsx` y `[id]/edit/page.tsx` (SuperAdmin). |
| 3.7 | Verificar RN-08: intentar eliminar habitación con reservas activas → 409. |
| 3.8 | Verificar RN-03: recepcionista intenta POST /api/rooms → 403. |

---

### Fase 4 — Gestión de Clientes
> Rol: Ingeniero Fullstack — Registro de clientes y portal de huéspedes

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_clients.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Client`, `ClientWithReservations`, `CreateClientRequest` y schemas Zod (RN-05). |
| 4.3 | Extender `dataService`: `getClients`, `getClientById` (con sus reservas), `createClient`, `updateClient`, `deleteClient` (SuperAdmin). Búsqueda con ILIKE. |
| 4.4 | Al crear un cliente, opcionalmente se puede crear también un usuario con role='cliente' para darle acceso al portal. El user_id queda vinculado en clients. Contraseña temporal con must_change_password=true. |
| 4.5 | API Routes: `GET/POST /api/clients`, `GET /api/clients/search?q=`, `GET/PUT/DELETE /api/clients/[id]`. |
| 4.6 | Crear `app/clients/page.tsx`: listado con `ClientSearchInput` con debounce 300ms. |
| 4.7 | Crear `app/clients/[id]/page.tsx`: perfil del cliente con historial de reservas. |
| 4.8 | Verificar RN-05: email o documento duplicado → 409 con mensaje diferenciado. |
| 4.9 | Verificar RN-07: el cliente autenticado no puede ver el perfil de otro cliente. |

---

### Fase 5 — Sistema de Reservas
> Rol: Ingeniero Fullstack Senior — Operación más crítica del sistema

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_reservations.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Extender `dataService`: `createReservation` (secuencia completa de sección 10.2), `getReservations`, `getMyReservations`, `cancelReservation`. |
| 5.3 | API Routes: `GET/POST /api/reservations`, `GET /api/reservations/my` (cliente), `GET /api/reservations/[id]`, `POST /api/reservations/[id]/cancel`. |
| 5.4 | Crear `app/reservations/new/page.tsx`: `ReservationForm` con `ClientSearchInput`, `DateRangePicker`, selector de habitaciones disponibles (se filtra dinámicamente al cambiar fechas), total calculado automáticamente. |
| 5.5 | Crear `app/reservations/page.tsx` (Recepcionista/SuperAdmin): listado con filtros. |
| 5.6 | Conectar `app/my-reservations/page.tsx` con datos reales del cliente autenticado. |
| 5.7 | Verificar RN-02: crear dos reservas solapadas para la misma habitación → 409. |
| 5.8 | Verificar RN-04: al crear → habitación "ocupada"; al cancelar → habitación "disponible". |
| 5.9 | Verificar RN-09: snapshot del precio — cambiar el precio de la habitación y verificar que las reservas anteriores conservan el precio original. |

---

### Fase 6 — Administración y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 6.1 | Gestión de usuarios: POST genera contraseña temporal, must_change_password=true, retorna en claro una sola vez. Login → /profile si must_change_password. |
| 6.2 | Crear `app/admin/users/page.tsx` y `app/admin/audit/page.tsx`. |
| 6.3 | Empty states: dashboard sin reservas hoy, habitaciones sin filtros disponibles, sin clientes registrados, sin reservas para el cliente. |
| 6.4 | Manejo de errores: 401, 403, 409 (solapamiento con fechas del conflicto), 409 (habitación con reservas al eliminar), 409 (email/documento duplicado diferenciados), 500. |
| 6.5 | Verificar el portal del cliente: login → /my-reservations → intentar ir a /rooms → redirect silencioso. |
| 6.6 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 6.7 | Deploy en Vercel con todas las variables de entorno. |
| 6.8 | Probar en producción: SuperAdmin crea habitaciones → crea cliente con cuenta digital → cliente hace login → ve sus reservas → Recepcionista crea reserva → habitación cambia a ocupada → dashboard actualizado. |

---

## 18. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | El SuperAdmin crea todos los usuarios. |
| RS-02 | Sin recuperación de contraseña por correo | Solo cambio de contraseña autenticado. Sin Resend en v1. |
| RS-03 | Sin cancelación por el cliente | El cliente solo puede ver sus reservas — no cancelarlas. |
| RS-04 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login del SuperAdmin. |

---

## 19. Glosario

| Término | Definición |
|---|---|
| **SuperAdmin** | Rol con acceso total al sistema incluyendo CRUD de habitaciones y usuarios. |
| **Recepcionista** | Rol operativo. Gestiona clientes y reservas. No puede eliminar habitaciones. |
| **Cliente** | Huésped con cuenta opcional para ver sus propias reservas. |
| **Solapamiento** | Dos reservas con fechas que se cruzan en la misma habitación. El sistema lo impide. |
| **Snapshot de precio** | Copia del precio por noche al crear la reserva. No cambia si el precio cambia después. |
| **Portal del cliente** | Sección `/my-reservations` accesible solo con role='cliente'. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |

---

> Última actualización: Mayo 2026
> Xavi Jiménez | Doc: 1082912449
> Curso: Lógica y Programación — SIST0200
