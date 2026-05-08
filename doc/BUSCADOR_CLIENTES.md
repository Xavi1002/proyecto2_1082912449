# Buscador de Clientes 🔍

## Descripción General
El sistema incluye un buscador completo que permite encontrar clientes por nombre y visualizar todas sus reservas asociadas. Es una herramienta esencial para gestionar información de clientes y su historial de reservas.

## Acceso a la Funcionalidad

### Desde la Interfaz
1. **Navega a la página de búsqueda**: Haz clic en "Buscador" en la barra de navegación (NavBar)
2. **URL directa**: `http://localhost:3000/search` (requiere autenticación)

## Funcionalidades Principales

### 1. Búsqueda de Clientes
- **Campo de búsqueda**: Escribe el nombre del cliente (búsqueda parcial)
- **Búsqueda insensible a mayúsculas**: "Juan", "juan", "JUAN" funcionan igual
- **Búsqueda flexible**: No necesitas escribir el nombre completo
- **Limitaciones**: 
  - Solo busca entre clientes activos
  - Solo busca clientes con rol "CLIENTE"
  - Máximo 50 resultados

### 2. Resultados de Búsqueda
- **Cards de clientes**: Muestra nombre y email
- **Cantidad de resultados**: Indica cuántos clientes se encontraron
- **Interactividad**: Haz clic en cualquier cliente para ver sus reservas

### 3. Visualización de Reservas
Una vez seleccionas un cliente, ves:
- **Información del cliente**: Nombre completo, email e ID
- **Lista de reservas**: Todas las reservas del cliente
- **Detalles por reserva**:
  - Fechas de entrada y salida
  - Cantidad de noches
  - Número de huéspedes
  - Habitación reservada (número y tipo)
  - Precio total
  - Estado de la reserva (Confirmada, Pendiente, Cancelada, Completada)

### 4. Controles
- **Botón "Buscar"**: Ejecuta la búsqueda
- **Botón "Limpiar"**: Resetea toda la búsqueda (aparece después de buscar)
- **Botón "Volver"**: Regresa a la lista de clientes (desde detalles)

## Flujo de Uso

```
Entrada en página /search
    ↓
[Escribir nombre del cliente]
    ↓
[Hacer clic en "Buscar"]
    ↓
Ver lista de clientes encontrados
    ↓
[Hacer clic en un cliente]
    ↓
Ver información del cliente y sus reservas
    ↓
[Volver] o [Limpiar] para nueva búsqueda
```

## API Endpoints Utilizados

### 1. Búsqueda de Clientes
**Endpoint**: `GET /users/search`

```bash
curl -X GET "http://localhost:8000/users/search?name=juan" \
  -H "Authorization: Bearer <token>"
```

**Parámetros**:
- `name` (required): Nombre del cliente a buscar

**Respuesta exitosa** (200):
```json
{
  "users": [
    {
      "id": 1,
      "name": "Juan García",
      "email": "juan@example.com"
    }
  ],
  "count": 1
}
```

**Errores**:
- `400`: Término de búsqueda requerido
- `500`: Error del servidor

---

### 2. Obtener Reservas de un Cliente
**Endpoint**: `GET /reservations`

```bash
curl -X GET "http://localhost:8000/reservations?userId=1"
```

**Parámetros**:
- `userId` (optional): ID del cliente
- `status` (optional): Estado de la reserva (Confirmada, Cancelada, etc.)
- `startDate` (optional): Fecha de inicio
- `endDate` (optional): Fecha de fin

**Respuesta exitosa** (200):
```json
{
  "count": 2,
  "reservations": [
    {
      "id": 1,
      "userId": 1,
      "roomId": 5,
      "checkInDate": "2026-05-01",
      "checkOutDate": "2026-05-05",
      "numberOfGuests": 2,
      "totalPrice": "400.00",
      "status": "Confirmada",
      "room": {
        "id": 5,
        "roomNumber": "101",
        "type": "Doble",
        "capacity": 2,
        "pricePerNight": "100.00"
      },
      "user": {
        "id": 1,
        "name": "Juan García",
        "email": "juan@example.com"
      }
    }
  ]
}
```

## Componentes Involucrados

### Frontend

#### Página `/search` - [frontend/src/pages/search.tsx](../frontend/src/pages/search.tsx)
- Estructura principal de la página
- Incluye layout y estilos globales
- Protegida con autenticación

#### Componente `ClientSearch` - [frontend/src/components/ClientSearch.tsx](../frontend/src/components/ClientSearch.tsx)
- **Funcionalidades**:
  - Manejo del formulario de búsqueda
  - Llamadas API para buscar clientes
  - Cargar reservas de cliente seleccionado
  - Mostrar resultados con estilos mejorados
  - Cálculo de noches y formateo de fechas

- **Estados principales**:
  - `searchTerm`: Término actual en el campo
  - `searchedTerm`: Último término buscado
  - `searchResults`: Lista de clientes encontrados
  - `selectedUser`: Cliente actualmente seleccionado
  - `userReservations`: Reservas del cliente seleccionado
  - `searchLoading`: Estado de carga de búsqueda
  - `reservationsLoading`: Estado de carga de reservas
  - `error`: Mensajes de error
  - `noResults`: Indica si no hay resultados

### Backend

#### Ruta `GET /users/search` - [backend/src/routes/users.ts](../backend/src/routes/users.ts)
- Requiere autenticación
- Mapea al controlador `searchUsersByName`

#### Controlador `searchUsersByName` - [backend/src/controllers/userController.ts](../backend/src/controllers/userController.ts)
```typescript
export const searchUsersByName = async (req: Request, res: Response) => {
  // Valida parámetro 'name'
  // Busca clientes con rol CLIENTE activos
  // Búsqueda insensible a mayúsculas (iLike)
  // Devuelve máximo 50 resultados
  // Ordena alfabéticamente
}
```

#### Controlador `getReservations` - [backend/src/controllers/reservationController.ts](../backend/src/controllers/reservationController.ts)
- Soporta filtrar por `userId`
- Incluye información relacionada (usuario, habitación)
- Ordena por fecha de entrada descendente

## Requisitos de Autenticación

✅ **El buscador requiere estar autenticado**
- Si no estás logueado, serás redirigido a `/login`
- El token de autenticación se envía automáticamente

## Estilos y Experiencia de Usuario

### Colores principales
- **Búsqueda**: Azul (#3b82f6)
- **Limpiar**: Rojo (#ef4444)
- **Volver**: Cian (#0ea5e9)
- **Estados de reserva**:
  - Confirmada: Verde (#28a745)
  - Pendiente: Amarillo (#ffc107)
  - Cancelada: Rojo (#dc3545)
  - Completada: Cian (#17a2b8)

### Diseño responsivo
- Adaptable a dispositivos móviles
- Grid dinámico para resultados
- Cards con diseño moderno y sombras

## Casos de Uso

### 1. Verificar historial de un cliente
```
Gerente de hotel busca "María" → Selecciona "María Pérez" → 
Ve todas sus 5 reservas pasadas y futuras
```

### 2. Investigar cancelaciones
```
Recepcionista busca "Carlos" → Selecciona cliente → 
Ve qué reservas fueron canceladas y cuándo
```

### 3. Confirmar disponibilidad antes de nueva reserva
```
Staff busca cliente existente → Ve sus reservas pendientes →
Decide si puede aceptar nueva reserva en esas fechas
```

## Límitaciones Actuales

- ⚠️ No hay paginación, máximo 50 resultados
- ⚠️ No hay opción de exportar datos
- ⚠️ No hay filtros avanzados de fechas

## Mejoras Implementadas (v2.0)

## Mejoras Implementadas (v2.0)

### 🚀 Búsqueda con Debounce
- **Búsqueda automática**: Los resultados se actualizan automáticamente mientras escribes
- **Debounce de 500ms**: Espera 500ms después de que dejes de escribir para enviar la solicitud
- **Reduce carga del servidor**: Evita múltiples solicitudes innecesarias
- **Mejor experiencia UX**: Resultados más rápidos sin tener que hacer clic en "Buscar"

### 💡 Mejoras de Interfaz
- **Indicador visual**: Muestra 🔍 "Buscando..." mientras se realiza la búsqueda
- **Sugerencia de búsqueda**: Mensaje informativo explicando que la búsqueda es automática
- **Input mejorado**: El campo de búsqueda ahora usa un wrapper para mejor espaciado

### 📊 Rendimiento
- **Menos solicitudes HTTP**: El debounce reduce el número de llamadas al servidor
- **Búsqueda más rápida**: Los resultados aparecen sin necesidad de hacer clic
- **Optimización de UX**: La interfaz es más receptiva y fluida

## Mejoras Futuras Sugeridas

1. **Búsqueda avanzada**: Por email, teléfono, rango de fechas
2. **Exportación de datos**: PDF o CSV
3. **Gráficos**: Gastos del cliente, frecuencia de reservas
4. **Paginación**: Manejar más de 50 resultados
5. **Historial de búsqueda**: Últimos clientes buscados
6. **Acciones rápidas**: Hacer nueva reserva desde búsqueda
7. **Búsqueda por múltiples campos**: Nombre + email simultáneamente
8. **Filtros por estado**: Mostrar solo clientes con reservas activas/confirmadas

## Troubleshooting

### "No se encontraron clientes"
- ✓ Verifica que el nombre esté correctamente escrito
- ✓ Asegúrate de que el cliente está activo
- ✓ Comprueba que el usuario tiene rol "CLIENTE"

### "Error al cargar las reservas del cliente"
- ✓ Verifica la conexión a internet
- ✓ Comprueba que el backend está ejecutándose
- ✓ Revisa la consola del navegador para más detalles

### No ves cambios después de buscar
- ✓ Espera a que la búsqueda termine
- ✓ Verifica que el servidor esté respondiendo
- ✓ Recarga la página y vuelve a intentar

## Resumen

El buscador de clientes es una herramienta fundamental para:
- ✅ Localizar clientes rápidamente
- ✅ Revisar historial de reservas
- ✅ Tomar decisiones informadas
- ✅ Mejorar servicio al cliente

¡Úsalo para gestionar mejor tu información de clientes!
