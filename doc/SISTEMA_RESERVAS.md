# Sistema de Reservas

## Descripción

Sistema completo de gestión de reservas hoteleras. Permite crear, consultar, modificar y cancelar reservas de habitaciones, con validación automática de disponibilidad y cálculo de precios.

## Características

- ✅ Crear nuevas reservas
- ✅ Verificar disponibilidad de habitaciones por fechas
- ✅ Listar reservas del usuario actual
- ✅ Actualizar reservas (fechas, huéspedes, solicitudes)
- ✅ Cancelar reservas
- ✅ Ver estadísticas de reservas (ingresos, conteos por estado)
- ✅ Búsqueda y filtrado de reservas
- ✅ Cálculo automático de precio total

## Campos de Reserva

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único |
| userId | INTEGER | ID del usuario/cliente |
| roomId | INTEGER | ID de la habitación |
| checkInDate | DATE | Fecha de entrada |
| checkOutDate | DATE | Fecha de salida |
| numberOfGuests | INTEGER | Número de huéspedes |
| totalPrice | DECIMAL | Precio total calculado |
| status | ENUM | Estado de la reserva |
| specialRequests | TEXT | Solicitudes especiales del cliente |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Fecha de actualización |

## Estados de Reserva

- **Pendiente** - Reserva creada, en espera de confirmación
- **Confirmada** - Reserva confirmada y válida
- **Cancelada** - Reserva cancelada
- **Completada** - Reserva finalizada (cliente ya salió)

## Validaciones

- La fecha de salida debe ser posterior a la de entrada
- Las fechas de reserva no pueden ser en el pasado
- El número de huéspedes no puede exceder la capacidad de la habitación
- No se permite doble reserva: la habitación no puede estar reservada por otro cliente en las mismas fechas
- El precio total se calcula automáticamente: (checkOutDate - checkInDate) × pricePerNight

## API Endpoints

### Verificar Disponibilidad (Público)

```http
GET /api/reservations/availability?checkInDate=2024-01-15&checkOutDate=2024-01-20&roomType=Doble
```

**Parámetros Query:**
- `checkInDate` (YYYY-MM-DD) - Fecha de entrada requerida
- `checkOutDate` (YYYY-MM-DD) - Fecha de salida requerida
- `roomType` (opcional) - Filtrar por tipo de habitación

**Respuesta (200):**
```json
{
  "checkInDate": "2024-01-15T00:00:00.000Z",
  "checkOutDate": "2024-01-20T00:00:00.000Z",
  "numberOfDays": 5,
  "availableRooms": [
    {
      "id": 1,
      "roomNumber": "101",
      "type": "Doble",
      "pricePerNight": "100.00",
      "capacity": 2,
      "totalPrice": "500.00"
    }
  ]
}
```

**Con curl:**
```bash
curl -X GET "http://localhost:3001/api/reservations/availability?checkInDate=2024-01-15&checkOutDate=2024-01-20"
```

### Crear Reserva (Protegido)

```http
POST /api/reservations
Content-Type: application/json
Authorization: Bearer <token>

{
  "roomId": 1,
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20",
  "numberOfGuests": 2,
  "specialRequests": "Cuna, piso alto si es posible"
}
```

**Respuesta (201):**
```json
{
  "message": "Reserva creada exitosamente",
  "reservation": {
    "id": 1,
    "userId": 5,
    "roomId": 1,
    "checkInDate": "2024-01-15T00:00:00.000Z",
    "checkOutDate": "2024-01-20T00:00:00.000Z",
    "numberOfGuests": 2,
    "totalPrice": "500.00",
    "status": "Pendiente",
    "specialRequests": "Cuna, piso alto si es posible",
    "user": {
      "id": 5,
      "name": "Juan García",
      "email": "juan@example.com",
      "role": "Cliente"
    },
    "room": {
      "id": 1,
      "roomNumber": "101",
      "type": "Doble",
      "pricePerNight": "100.00"
    }
  }
}
```

**Con curl:**
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "roomId": 1,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-20",
    "numberOfGuests": 2,
    "specialRequests": "Cuna"
  }'
```

### Listar Todas las Reservas (Público)

```http
GET /api/reservations?status=Confirmada&startDate=2024-01-01&endDate=2024-12-31
```

**Parámetros Query:**
- `status` (opcional) - Filtrar por estado
- `userId` (opcional) - Filtrar por usuario
- `roomId` (opcional) - Filtrar por habitación
- `startDate` (opcional) - Fecha inicial (YYYY-MM-DD)
- `endDate` (opcional) - Fecha final (YYYY-MM-DD)

**Respuesta (200):**
```json
{
  "count": 15,
  "reservations": [
    {
      "id": 1,
      "userId": 5,
      "roomId": 1,
      "checkInDate": "2024-01-15T00:00:00.000Z",
      "checkOutDate": "2024-01-20T00:00:00.000Z",
      "numberOfGuests": 2,
      "totalPrice": "500.00",
      "status": "Confirmada",
      "specialRequests": "Cuna"
    }
  ]
}
```

**Con curl:**
```bash
curl -X GET "http://localhost:3001/api/reservations?status=Confirmada"
```

### Obtener Mi Reservas (Protegido)

```http
GET /api/reservations/my-reservations
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "count": 3,
  "reservations": [
    {
      "id": 1,
      "userId": 5,
      "roomId": 1,
      "checkInDate": "2024-01-15T00:00:00.000Z",
      "checkOutDate": "2024-01-20T00:00:00.000Z",
      "numberOfGuests": 2,
      "totalPrice": "500.00",
      "status": "Confirmada"
    }
  ]
}
```

**Con curl:**
```bash
curl -X GET http://localhost:3001/api/reservations/my-reservations \
  -H "Authorization: Bearer tu_token_aqui"
```

### Obtener Reserva por ID (Público)

```http
GET /api/reservations/1
```

**Respuesta (200):**
```json
{
  "id": 1,
  "userId": 5,
  "roomId": 1,
  "checkInDate": "2024-01-15T00:00:00.000Z",
  "checkOutDate": "2024-01-20T00:00:00.000Z",
  "numberOfGuests": 2,
  "totalPrice": "500.00",
  "status": "Confirmada",
  "specialRequests": "Cuna"
}
```

**Con curl:**
```bash
curl -X GET http://localhost:3001/api/reservations/1
```

### Actualizar Reserva (Protegido)

```http
PUT /api/reservations/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "checkInDate": "2024-01-16",
  "checkOutDate": "2024-01-21",
  "numberOfGuests": 3,
  "specialRequests": "Cuna actualizada"
}
```

**Respuesta (200):**
```json
{
  "message": "Reserva actualizada exitosamente",
  "reservation": {
    "id": 1,
    "userId": 5,
    "roomId": 1,
    "checkInDate": "2024-01-16T00:00:00.000Z",
    "checkOutDate": "2024-01-21T00:00:00.000Z",
    "numberOfGuests": 3,
    "totalPrice": "600.00",
    "status": "Confirmada",
    "specialRequests": "Cuna actualizada"
  }
}
```

**Con curl:**
```bash
curl -X PUT http://localhost:3001/api/reservations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "numberOfGuests": 3,
    "specialRequests": "Cuna actualizada"
  }'
```

### Cancelar Reserva (Protegido - DELETE)

```http
DELETE /api/reservations/1
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "message": "Reserva cancelada exitosamente",
  "reservation": {
    "id": 1,
    "status": "Cancelada"
  }
}
```

**Con curl:**
```bash
curl -X DELETE http://localhost:3001/api/reservations/1 \
  -H "Authorization: Bearer tu_token_aqui"
```

### Obtener Estadísticas de Reservas (Público)

```http
GET /api/reservations/statistics
```

**Respuesta (200):**
```json
{
  "total": 45,
  "byStatus": {
    "Pendiente": 5,
    "Confirmada": 35,
    "Cancelada": 3,
    "Completada": 2
  },
  "totalRevenue": 15750.50
}
```

**Con curl:**
```bash
curl -X GET http://localhost:3001/api/reservations/statistics
```

## Componentes Frontend

### ReservationForm
Componente para crear nuevas reservas. Incluye:
- Selector de fechas (entrada/salida)
- Búsqueda de disponibilidad
- Selección de habitación disponible
- Cálculo automático de precio
- Número de huéspedes
- Solicitudes especiales

**Uso:**
```tsx
<ReservationForm onSuccess={handleSuccess} onCancel={handleCancel} />
```

### ReservationList
Componente para mostrar lista de reservas. Incluye:
- Filtrado por estado
- Visualización de detalles
- Botón para cancelar reservas
- Cálculo de noches
- Badges de estado con colores

**Uso:**
```tsx
<ReservationList myReservationsOnly={true} />
```

### Página /reservations
Página protegida que muestra:
- Estadísticas: total, confirmadas, pendientes, ingresos
- Formulario para crear nuevas reservas
- Lista de reservas del usuario

## Lógica de Disponibilidad

El sistema verifica disponibilidad considerando:

1. **Reservas activas:** Solo reservas con estado != 'Cancelada'
2. **Conflicto de fechas:** Una habitación está ocupada si:
   - `checkInDate <= requestCheckOut` AND
   - `checkOutDate >= requestCheckIn`
3. **Búsqueda:** Retorna habitaciones que NO tienen conflicto

```sql
-- Conflictos encontrados:
WHERE status != 'Cancelada'
  AND checkInDate < requestCheckOut
  AND checkOutDate > requestCheckIn
```

## Cálculo de Precio

El precio total se calcula automáticamente:

```
totalPrice = numberOfDays × room.pricePerNight

Donde:
numberOfDays = (checkOutDate - checkInDate) en días
room.pricePerNight = Precio de la habitación por noche
```

## Estados HTTP

- **200** - Operación exitosa
- **201** - Recurso creado exitosamente
- **400** - Validación fallida (fechas, capacidad, etc)
- **401** - Usuario no autenticado
- **404** - Reserva/Habitación no encontrada
- **409** - Conflicto (habitación no disponible)
- **500** - Error del servidor

## Ejemplos Prácticos

### Crear una reserva para 2 personas del 15 al 20 de enero

```bash
# 1. Verificar disponibilidad
curl -X GET "http://localhost:3001/api/reservations/availability?checkInDate=2024-01-15&checkOutDate=2024-01-20"

# 2. Crear reserva (con token obtenido del login)
curl -X POST http://localhost:3001/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{
    "roomId": 1,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-20",
    "numberOfGuests": 2,
    "specialRequests": "Cuna para bebé"
  }'
```

### Consultar mis reservas

```bash
curl -X GET http://localhost:3001/api/reservations/my-reservations \
  -H "Authorization: Bearer tu_token_aqui"
```

### Cancelar una reserva

```bash
curl -X DELETE http://localhost:3001/api/reservations/1 \
  -H "Authorization: Bearer tu_token_aqui"
```

## Notas Importantes

- Las fechas deben estar en formato ISO 8601 (YYYY-MM-DD)
- El usuario debe estar autenticado para crear/modificar/cancelar reservas propias
- Los SuperAdmin pueden ver todas las reservas
- El precio se recalcula automáticamente si se cambian las fechas
- No se puede actualizar una reserva ya cancelada o completada
- Las solicitudes especiales son opcionales
