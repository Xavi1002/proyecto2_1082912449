# CRUD de Habitaciones

## Descripción

Sistema completo de gestión de habitaciones con Create, Read, Update y Delete. Permite gestionar el inventario de habitaciones del hotel, incluyendo tipo, estado, precio y capacidad.

## Características

- ✅ Crear nuevas habitaciones
- ✅ Listar y filtrar habitaciones por tipo y estado
- ✅ Editar información de habitaciones
- ✅ Eliminar habitaciones
- ✅ Cambiar estado de habitaciones
- ✅ Ver estadísticas de habitaciones
- ✅ Buscar habitaciones por número

## Campos de Habitación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único |
| roomNumber | STRING | Número de habitación (ej: 101, 202) |
| type | ENUM | Individual, Doble, Triple, Suite |
| status | ENUM | Disponible, Ocupada, Mantenimiento, Limpieza |
| pricePerNight | DECIMAL | Precio por noche en dólares |
| capacity | INTEGER | Número de personas que puede alojar |
| description | TEXT | Descripción adicional |
| amenities | JSON | Array de amenities (WiFi, TV, etc) |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Fecha de actualización |

## Tipos de Habitaciones

- **Individual** - Para 1 persona
- **Doble** - Para 2 personas
- **Triple** - Para 3 personas
- **Suite** - Habitación de lujo

## Estados de Habitaciones

- **Disponible** - Disponible para reservar
- **Ocupada** - Actualmente ocupada
- **Mantenimiento** - En mantenimiento
- **Limpieza** - En proceso de limpieza

## API Endpoints

### Lectura (Público)

```http
GET /api/rooms
```
Obtener todas las habitaciones con filtros opcionales.

**Parámetros de query:**
- `type` - Filtrar por tipo (Individual, Doble, Triple, Suite)
- `status` - Filtrar por estado (Disponible, Ocupada, etc)
- `search` - Buscar por número de habitación

**Response:**
```json
{
  "count": 10,
  "rooms": [
    {
      "id": 1,
      "roomNumber": "101",
      "type": "Doble",
      "status": "Disponible",
      "pricePerNight": "89.99",
      "capacity": 2,
      "description": "Habitación doble confortable",
      "amenities": ["WiFi", "TV", "Aire Acondicionado"]
    }
  ]
}
```

---

```http
GET /api/rooms/:id
```
Obtener una habitación específica por ID.

---

```http
GET /api/rooms/statistics
```
Obtener estadísticas de habitaciones.

**Response:**
```json
{
  "total": 50,
  "byStatus": {
    "Disponible": 30,
    "Ocupada": 15,
    "Mantenimiento": 3,
    "Limpieza": 2
  },
  "byType": {
    "Individual": 10,
    "Doble": 25,
    "Triple": 10,
    "Suite": 5
  },
  "averagePrice": 125.50
}
```

---

```http
GET /api/rooms/availability
```
Obtener disponibilidad de habitaciones por tipo.

**Response:**
```json
{
  "availableRooms": [
    {
      "type": "Doble",
      "total": 15
    },
    {
      "type": "Individual",
      "total": 8
    }
  ]
}
```

### Escritura (Requiere autenticación)

```http
POST /api/rooms
Authorization: Bearer <token>
```
Crear una nueva habitación.

**Body:**
```json
{
  "roomNumber": "201",
  "type": "Doble",
  "status": "Disponible",
  "pricePerNight": 89.99,
  "capacity": 2,
  "description": "Habitación doble confortable",
  "amenities": ["WiFi", "TV", "Aire Acondicionado", "Minibar"]
}
```

**Response (201):**
```json
{
  "message": "Habitación creada exitosamente",
  "room": { ... }
}
```

---

```http
PUT /api/rooms/:id
Authorization: Bearer <token>
```
Actualizar una habitación.

**Body (campos opcionales):**
```json
{
  "roomNumber": "201",
  "type": "Doble",
  "status": "Mantenimiento",
  "pricePerNight": 99.99,
  "capacity": 2,
  "description": "Actualización",
  "amenities": ["WiFi", "TV"]
}
```

---

```http
PATCH /api/rooms/:id/status
Authorization: Bearer <token>
```
Cambiar solo el estado de una habitación.

**Body:**
```json
{
  "status": "Disponible"
}
```

---

```http
DELETE /api/rooms/:id
Authorization: Bearer <token>
```
Eliminar una habitación.

**Response:**
```json
{
  "message": "Habitación eliminada exitosamente",
  "roomId": 1
}
```

## Ejemplos con cURL

### Crear habitación

```bash
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "roomNumber": "101",
    "type": "Doble",
    "status": "Disponible",
    "pricePerNight": 89.99,
    "capacity": 2,
    "description": "Habitación confortable",
    "amenities": ["WiFi", "TV", "AC"]
  }'
```

### Obtener todas las habitaciones

```bash
curl http://localhost:3001/api/rooms
```

### Filtrar por estado

```bash
curl "http://localhost:3001/api/rooms?status=Disponible"
```

### Filtrar por tipo

```bash
curl "http://localhost:3001/api/rooms?type=Doble"
```

### Obtener habitación específica

```bash
curl http://localhost:3001/api/rooms/1
```

### Actualizar habitación

```bash
curl -X PUT http://localhost:3001/api/rooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pricePerNight": 99.99,
    "status": "Ocupada"
  }'
```

### Cambiar estado

```bash
curl -X PATCH http://localhost:3001/api/rooms/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "Limpieza"}'
```

### Eliminar habitación

```bash
curl -X DELETE http://localhost:3001/api/rooms/1 \
  -H "Authorization: Bearer <token>"
```

### Ver estadísticas

```bash
curl http://localhost:3001/api/rooms/statistics
```

## Uso en Frontend

### Componente RoomList

Muestra todas las habitaciones con filtros.

```tsx
import RoomList from '@/components/RoomList'

<RoomList 
  onEdit={(room) => console.log('Editar', room)}
/>
```

### Componente RoomForm

Formulario para crear o editar habitaciones.

```tsx
import RoomForm from '@/components/RoomForm'

<RoomForm 
  room={editingRoom}
  onSuccess={() => console.log('Guardado')}
  onCancel={() => console.log('Cancelado')}
/>
```

### Página de Habitaciones

Accesible desde `/rooms` - requiere autenticación.

Características:
- Vista de todas las habitaciones
- Filtros por tipo y estado
- Estadísticas en tiempo real
- Crear, editar y eliminar habitaciones
- Búsqueda por número de habitación

## Validaciones

### Crear/Actualizar

- **roomNumber**: Requerido, único, formato de texto
- **type**: Requerido, debe ser uno de los valores permitidos
- **status**: Opcional, debe ser uno de los valores permitidos
- **pricePerNight**: Requerido, número > 0
- **capacity**: Opcional, número entre 1-10
- **description**: Opcional, texto libre
- **amenities**: Opcional, array de strings

### Errores Comunes

**409 - Número de habitación duplicado**
```json
{
  "error": "El número de habitación ya existe"
}
```

**400 - Tipo de habitación inválido**
```json
{
  "error": "Tipo de habitación inválido. Valores permitidos: Individual, Doble, Triple, Suite"
}
```

**400 - Precio inválido**
```json
{
  "error": "El precio por noche debe ser mayor a 0"
}
```

**404 - Habitación no encontrada**
```json
{
  "error": "Habitación no encontrada"
}
```

**401 - No autenticado**
```json
{
  "error": "Token no proporcionado"
}
```

## Control de Acceso

- **Lectura**: Pública (sin autenticación)
- **Escritura**: Requiere autenticación
- **Administración completa**: SuperAdmin y Recepción

## Casos de Uso

### 1. Crear nueva habitación
1. Ir a `/rooms`
2. Click en "+ Nueva Habitación"
3. Rellenar formulario
4. Click en "Crear"

### 2. Editar habitación existente
1. Ir a `/rooms`
2. Click en "Editar" en la tarjeta de habitación
3. Modificar campos
4. Click en "Actualizar"

### 3. Cambiar estado de habitación
1. Editar habitación
2. Cambiar el campo "Estado"
3. Actualizar

### 4. Ver estadísticas
- Las estadísticas se muestran en el dashboard de habitaciones
- Total, por estado, por tipo y precio promedio

## Próximas Mejoras

- [ ] Importar/exportar habitaciones (CSV/Excel)
- [ ] Subir fotos de habitaciones
- [ ] Gestión de precios dinámicos
- [ ] Historial de cambios
- [ ] Validación de disponibilidad con reservas
