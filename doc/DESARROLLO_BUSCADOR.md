# Desarrollo del Buscador de Clientes - Guía Técnica

## Descripción General
Este documento proporciona una guía técnica completa para desarrolladores sobre la implementación, estructura y mejoras del sistema de búsqueda de clientes.

## Arquitectura

### Frontend Stack
- **Framework**: Next.js 13+
- **Lenguaje**: TypeScript
- **Estilos**: CSS-in-JS (inline styles)
- **Autenticación**: Token JWT

### Backend Stack
- **Framework**: Express.js
- **ORM**: Sequelize
- **Base de datos**: PostgreSQL
- **Autenticación**: Middleware JWT

## Estructura de Componentes

### Componente Principal: ClientSearch
**Ubicación**: [frontend/src/components/ClientSearch.tsx](../frontend/src/components/ClientSearch.tsx)

#### Interfaces Definidas
```typescript
interface User {
  id: number
  name: string
  email: string
}

interface Reservation {
  id: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  room?: {
    roomNumber: string
    type: string
  }
}
```

#### Estados (React Hooks)
```typescript
const [searchTerm, setSearchTerm] = useState('')              // Entrada actual
const [searchedTerm, setSearchedTerm] = useState('')         // Último término buscado
const [searchResults, setSearchResults] = useState<User[]>([]) // Clientes encontrados
const [selectedUser, setSelectedUser] = useState<User | null>(null) // Cliente seleccionado
const [userReservations, setUserReservations] = useState<Reservation[]>([]) // Sus reservas
const [searchLoading, setSearchLoading] = useState(false)     // Estado de carga búsqueda
const [reservationsLoading, setReservationsLoading] = useState(false) // Estado de carga reservas
const [reservationCount, setReservationCount] = useState(0)   // Contador de reservas
const [error, setError] = useState('')                       // Mensajes de error
const [noResults, setNoResults] = useState(false)            // Indicador sin resultados
const debounceTimer = useRef<NodeJS.Timeout | null>(null)    // Timer para debounce
```

#### Lógica de Debounce

```typescript
useEffect(() => {
  if (!searchTerm.trim()) {
    setSearchResults([])
    setNoResults(false)
    setError('')
    return
  }

  // Limpiar timer anterior
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current)
  }

  // Configurar nuevo timer con delay de 500ms
  debounceTimer.current = setTimeout(async () => {
    // ... ejecutar búsqueda
  }, 500)

  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
  }
}, [searchTerm])
```

**Ventajas del debounce**:
- Reduce carga del servidor
- Mejor rendimiento en búsquedas
- Evita solicitudes innecesarias
- UX más fluida

#### Métodos Principales

##### handleSearch (e: React.FormEvent)
- **Propósito**: Ejecuta búsqueda manual (cuando se hace submit del formulario)
- **Validaciones**: Verifica que el término no esté vacío
- **Llamada API**: `GET /users/search?name={searchTerm}`
- **Error handling**: Captura y muestra errores

##### handleSelectUser (user: User)
- **Propósito**: Carga las reservas de un cliente específico
- **Llamada API**: `GET /reservations?userId={userId}`
- **Relaciones**: Incluye datos de habitación y usuario
- **Estado**: Actualiza `selectedUser` y `userReservations`

##### handleBack ()
- **Propósito**: Regresa a la lista de clientes
- **Acción**: Limpia estado de usuario seleccionado

##### handleClear ()
- **Propósito**: Resetea toda la búsqueda
- **Acción**: Limpia todos los estados

#### Utilidades

##### formatDate (dateString: string)
```typescript
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
// Output: "01 may 2026"
```

##### calculateNights (checkIn: string, checkOut: string)
```typescript
const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}
// Output: 4
```

##### getStatusColor (status: string)
- Mapea estados de reserva a colores HEX
- Colores predefinidos para: Confirmada, Pendiente, Cancelada, Completada
- Fallback a gris si el estado no está definido

## Rutas Backend

### GET /users/search
**Archivo**: [backend/src/routes/users.ts](../backend/src/routes/users.ts)

```typescript
router.get('/users/search', authenticateToken, searchUsersByName)
```

**Middleware**: 
- ✅ `authenticateToken`: Requiere token JWT válido

**Controlador**: `searchUsersByName`
**Ubicación**: [backend/src/controllers/userController.ts](../backend/src/controllers/userController.ts)

#### Lógica del Controlador

```typescript
export const searchUsersByName = async (req: Request, res: Response) => {
  const { name } = req.query
  
  // 1. Validar parámetro
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Search term required' })
  }

  // 2. Normalizar nombre (trim)
  const normalizedName = name.trim()
  
  // 3. Obtener rol "CLIENTE"
  const clientRole = await Role.findOne({
    where: { name: RoleType.CLIENTE }
  })

  // 4. Buscar usuarios con:
  // - Rol: CLIENTE
  // - Estado: activo (isActive = true)
  // - Nombre: contiene el término (ILIKE para insensible a mayúsculas)
  // - Ordenado: alfabéticamente
  // - Limitado a: 50 resultados
  const users = await User.findAll({
    attributes: ['id', 'name', 'email'],
    where: {
      roleId: clientRole.id,
      isActive: true,
      name: { [Op.iLike]: `%${normalizedName}%` }
    },
    order: [['name', 'ASC']],
    limit: 50
  })

  res.json({ users, count: users.length })
}
```

**Seguridad**:
- Solo busca clientes activos
- Solo busca clientes con rol específico
- Nunca expone contraseñas
- Requiere autenticación

**Operador `iLike`**:
- Sequelize: `[Op.iLike]` = ILIKE de PostgreSQL
- Busca sin importar mayúsculas/minúsculas
- Soporta wildcards: `%term%`

### GET /reservations
**Archivo**: [backend/src/routes/reservations.ts](../backend/src/routes/reservations.ts)

```typescript
router.get('/reservations', getReservations)
```

**Nota**: Esta ruta NO requiere autenticación (pública)

**Controlador**: `getReservations`

#### Lógica del Controlador

```typescript
export const getReservations = async (req: Request, res: Response) => {
  const { status, userId, roomId, startDate, endDate } = req.query
  const where: any = {}

  // Filtros opcionales
  if (status) where.status = status
  if (userId) where.userId = userId        // ← Usado por el buscador
  if (roomId) where.roomId = roomId
  
  // Rango de fechas
  if (startDate || endDate) {
    where.checkInDate = {}
    if (startDate) where.checkInDate[Op.gte] = new Date(startDate)
    if (endDate) where.checkInDate[Op.lte] = new Date(endDate)
  }

  // Consultar con relaciones
  const reservations = await Reservation.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: Room, as: 'room' }
    ],
    order: [['checkInDate', 'DESC']]
  })

  res.json({
    count: reservations.length,
    reservations
  })
}
```

**Relaciones Incluidas**:
- User: Información del cliente
- Room: Información de la habitación

## Flujo de Datos

### Búsqueda de Cliente
```
Usuario escribe en input
    ↓
[onChange] actualiza searchTerm
    ↓
useEffect detecta cambio
    ↓
Limpiar timer anterior (si existe)
    ↓
Esperar 500ms (debounce)
    ↓
GET /users/search?name={searchTerm}
    ↓
Backend valida y busca en DB
    ↓
Actualizar setSearchResults
    ↓
Mostrar cards de clientes
```

### Cargar Reservas de Cliente
```
Usuario hace clic en cliente
    ↓
handleSelectUser(user)
    ↓
GET /reservations?userId={user.id}
    ↓
Backend obtiene reservas y relaciones
    ↓
Actualizar setUserReservations
    ↓
Mostrar lista de reservas
```

## Manejo de Errores

### Niveles de Error

1. **Validación Frontend**
   - Campo vacío: Mostrar mensaje "Por favor ingresa un nombre para buscar"
   - Indica qué es requerido

2. **Errores de Red**
   - `catch` en try-catch
   - Mostrar: "Error al buscar clientes. Intenta de nuevo."
   - Log en consola para debugging

3. **Respuesta Vacía**
   - `response.data.count === 0`
   - Mostrar: "No se encontraron clientes con el nombre..."
   - Diferente de error (UX mejor)

### Estados de Carga

```typescript
// Búsqueda
{searchLoading ? 'Buscando...' : 'Buscar'}

// Reservas
{reservationsLoading ? (
  <div>Cargando reservas...</div>
) : userReservations.length === 0 ? (
  <div>Este cliente no tiene reservas</div>
) : (
  // Mostrar lista
)}
```

## Estilos

### Sistema de Colores
```typescript
const colors = {
  primary: '#3b82f6',      // Azul (búsqueda)
  danger: '#ef4444',       // Rojo (limpiar)
  info: '#0ea5e9',         // Cian (volver)
  success: '#28a745',      // Verde (confirmada)
  warning: '#ffc107',      // Amarillo (pendiente)
  canceled: '#dc3545',     // Rojo (cancelada)
  completed: '#17a2b8',    // Cian (completada)
  background: '#f3f4f6',   // Fondo gris
  border: '#e5e7eb',       // Borde gris
}
```

### Diseño Responsivo
```typescript
// Mobile-first approach
resultsList: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem'
}

// Se adapta automáticamente:
// - 1 columna en móvil (320px)
// - 2-3 columnas en tablet
// - 3-4 columnas en desktop
```

## Pruebas Manuales

### Test Case 1: Búsqueda Básica
```
1. Abrir /search
2. Escribir "juan" lentamente
3. Esperar a que aparezcan resultados (500ms después de escribir)
4. Verificar que los nombres contienen "juan" (sin importar mayúsculas)
```

### Test Case 2: Sin Resultados
```
1. Escribir "xyzabc123" (nombre que no existe)
2. Esperar 500ms
3. Verificar mensaje "No se encontraron clientes"
```

### Test Case 3: Ver Reservas
```
1. Hacer búsqueda
2. Hacer clic en un cliente
3. Esperar a que carguen sus reservas
4. Verificar que se muestren correctamente
5. Hacer clic en "Volver"
6. Verificar que regresa a lista de clientes
```

### Test Case 4: Debounce
```
1. Escribir rápidamente "a b c d e f g h"
2. Dejar de escribir
3. Verificar que se ejecuta UNA sola solicitud (no 8)
4. Revisar Network tab para confirmar
```

## Performance

### Optimizaciones Implementadas
1. ✅ **Debounce**: Reduce solicitudes HTTP (500ms)
2. ✅ **Limit en BD**: Máximo 50 resultados por búsqueda
3. ✅ **Select attributes**: Solo id, name, email para clientes
4. ✅ **Include relaciones**: Solo cuando es necesario

### Métricas
- Tiempo de búsqueda: ~50-100ms (sin debounce)
- Debounce: 500ms espera
- Tamaño respuesta: ~1-5KB por búsqueda
- Tamaño respuesta: ~5-15KB por reservas cargadas

### Mejoras Futuras
1. **Paginación**: Para manejar >50 resultados
2. **Caché**: Almacenar resultados recientes
3. **SearchFilter**: Backend-side filtering más complejo
4. **GraphQL**: Reducir tamaño de payload
5. **Virtual scrolling**: Para listas muy largas

## Debugging

### Habilitar Logs
```typescript
// En handleSearch o useEffect
console.log('Búsqueda ejecutada:', { searchTerm, normalizedSearchTerm })
console.log('Resultados:', response.data)
```

### DevTools
1. **Network**: Ver solicitudes GET a `/users/search` y `/reservations`
2. **Console**: Buscar errores y logs
3. **React DevTools**: Inspeccionar estados del componente
4. **Application**: Verificar token JWT

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "401 Unauthorized" | Token expirado | Volver a login |
| "500 Error searching" | Rol CLIENTE no existe | Crear rol en BD |
| "No results" | Cliente inactivo | Activar cliente en BD |
| Búsqueda muy lenta | Sin debounce antes | Ya implementado ✅ |

## Roadmap de Mejoras

### v2.1 (Corto Plazo)
- [ ] Búsqueda por email además de nombre
- [ ] Indicador de número de reservas en cards
- [ ] Estadísticas del cliente (total gastado, reservas totales)

### v2.2 (Mediano Plazo)
- [ ] Búsqueda avanzada con múltiples criterios
- [ ] Filtros por estado de reserva
- [ ] Exportar datos a CSV

### v3.0 (Largo Plazo)
- [ ] Gráficos de gastos por cliente
- [ ] Historial de búsqueda guardado
- [ ] Búsqueda global (accesible desde navbar)
- [ ] Dashboard de clientes VIP

## Referencias

- [Documentación Buscador de Clientes](./BUSCADOR_CLIENTES.md)
- [Documentación de API](./API_TESTS.md)
- [Arquitectura del Sistema](./arquitectura.md)
- [Documentación de Autenticación](./autenticacion.md)

## Notas para el Equipo

### Convenciones de Código
- Estados: camelCase
- Funciones handler: `handle{Action}`
- Estilos: objeto con `as React.CSSProperties`
- Comentarios: Explicar el "por qué", no el "qué"

### Buenas Prácticas
1. Siempre limpiar timers en useEffect
2. Validar en frontend Y backend
3. No mostrar datos sensibles en logs
4. Usar optional chaining para relaciones (`?.`)
5. Manejar states de carga explícitamente

---
Última actualización: 22 de Abril, 2026
Versión: 2.0
