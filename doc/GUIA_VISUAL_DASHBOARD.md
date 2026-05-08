# Guía Visual del Dashboard Moderno

## 📐 Layout General

```
┌──────────────────────────────────────────────────────────────┐
│                  [Fondo Gradiente Animado]                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Panel de Control    [Fecha y Hora]                 │  │
│  │ Bienvenido, Usuario                                    │  │
│  │ Monitorea el estado del hotel en tiempo real           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           ESTADÍSTICAS PRINCIPALES (6 KPIs)            │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐         │  │
│  │  │ 🟢 Dispo │ 🔵 Ocupa │ 📅 Rese  │ 🔧 Mante │         │  │
│  │  │ Disponib │ Ocupadas │ Reservas │ Mantenim │         │  │
│  │  │    24    │    15    │    8     │    5     │         │  │
│  │  ├──────────┼──────────┼──────────┼──────────┤         │  │
│  │  │ 💰 Ingre │ 📊 Precio│          │          │         │  │
│  │  │ Ingresos │ Promedio │          │          │         │  │
│  │  │ $3,450   │  $125.50 │          │          │         │  │
│  │  └──────────┴──────────┴──────────┴──────────┘         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │        📊 ESTADO DE HABITACIONES                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Ocupación General                          En vivo │  │
│  │  │                                                   │  │
│  │  │        ╭─ 45% ─╮                                │  │
│  │  │       │           │                              │  │
│  │  │      │   45/100    │    ⚡ Ocupación normal      │  │
│  │  │       │           │                              │  │
│  │  │        ╰─────╯                                  │  │
│  │  │                                                   │  │
│  │  │ 🔴 Ocupadas      ███████░░░░░░░░░░░ 45%        │  │
│  │  │ 🟢 Disponibles   ███░░░░░░░░░░░░░░░░░░░░ 15%   │  │
│  │  │ 🔵 En limpieza   █░░░░░░░░░░░░░░░░░░░░░░░░░░ 5%│  │
│  │  │ 🟠 Mantenimiento ████░░░░░░░░░░░░░░░░░░░░░░░░░ 6%│  │
│  │  │                                                   │  │
│  │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │  │
│  │  │  Total   │ │ Ocupadas│ │Disponib │ │ Mante/L │ │  │
│  │  │  100     │ │   45    │ │   35    │ │   20    │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────┐ ┌────────────────────────┐  │
│  │  📅 PRÓXIMAS RESERVAS      │ │ 🏨 HABITACIONES       │  │
│  │  [8]                       │ │ Filter: [Active]      │  │
│  │  ┌──────────────────────┐  │ │ [Disponible] [Ocupada] │  │
│  │  │ 15 ago → 18 ago [HOY] │  │ │ [Limpieza] [Manten.]  │  │
│  │  │ Hab 101 • 2 huéspedes│  │ │ ┌──────────────────┐  │  │
│  │  │ Juan García          │  │ │ │ Hab. 101    🛏️🛏️│  │  │
│  │  │ $450.00              │  │ │ │ Doble     [Disponib]│  │
│  │  ├──────────────────────┤  │ │ │ 👥 2  💰 $125/noche
│  │  │ 16 ago → 20 ago      │  │ │ │                    │  │  
│  │  │ Hab 205 • 3 huéspedes│  │ │ ├──────────────────┤  │  
│  │  │ María López          │  │ │ │ Hab. 205    👑 │  │  
│  │  │ $600.00              │  │ │ │ Suite     [Ocupada]  │  
│  │  ├──────────────────────┤  │ │ │ 👥 3  💰 $250/noche
│  │  │ ...                  │  │ │ │                    │  │  
│  │  └──────────────────────┘  │ │ └──────────────────┘  │  │
│  └────────────────────────────┘ └────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Última actualización: 14:32:45 • Auto-refresh: cada 5min│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Código de Colores por Sección

### Encabezado y Navegación
- 🌈 Gradiente de fondo animado
- ⚪ Caja de hora con fondo blanco semitransparente

### Tarjetas de Estadísticas
| Color | Significado | Ejemplo |
|-------|-------------|---------|
| 🟢 Verde (#10b981) | Disponible / Positivo | Habitaciones disponibles |
| 🔵 Azul (#3b82f6) | Activo / Principal | Habitaciones ocupadas |
| 🔶 Naranja (#f97316) | Atención | Mantenimiento/Limpieza |
| 🟡 Amarillo (#eab308) | Importante | Ingresos totales |
| 🟣 Púrpura (#8b5cf6) | Información | Información general |

### Estado de Reservas
| Badge | Color | Significado |
|-------|-------|------------|
| HOY | 🟨 Amarillo | Check-in hoy |
| PRONTO | 🔴 Rojo | Próximos 3 días |
| PRÓXIMA | ⚪ Gris | Futura |

---

## ⚡ Características Interactivas

### Filtros de Habitaciones
```
┌────────────┬────────────┬─────────────┬──────────────┐
│ Disponible │ Ocupada    │ Limpieza    │ Mantenimiento│
└────────────┴────────────┴─────────────┴──────────────┘
     ↓ (Click para filtrar)
```
- **Botón Activo**: Fondo azul + sombra
- **Botón Inactivo**: Fondo blanco + borde gris

---

## 📱 Responsive Breakpoints

### Móvil (< 640px)
- Todos los componentes en stack vertical
- Grid de 1 columna para habitaciones
- Texto reducido
- Filtros ocupan todo el ancho

### Tablet (640px - 1024px)
- 2 columnas para estadísticas
- Grid de 2 columnas para habitaciones
- Layout 2 columnas: Reservas y Habitaciones lado a lado

### Desktop (> 1024px)
- 3 columnas para estadísticas (2 filas)
- Grid de 3-4 columnas para habitaciones
- Layout 2 columnas a pantalla completa

---

## 🎬 Animaciones

### Fade In (slideIn)
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
**Aplicado a**: Secciones principales

### Pulse (Indicador en vivo)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
**Aplicado a**: Punto verde "En vivo"

### Gradient (Fondo)
```css
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```
**Aplicado a**: Fondo principal, duración 15s

### Hover (Tarjetas)
```css
transform: translateY(-4px);
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
```
**Aplicado a**: Tarjetas de estadísticas y habitaciones

---

## 📊 Ejemplo de Datos

### Estadísticas (DashboardStats)
```json
{
  "totalRooms": 100,
  "availableRooms": 24,
  "occupiedRooms": 45,
  "maintenanceRooms": 20,
  "activeReservations": 8,
  "totalRevenue": 3450.00,
  "averagePrice": 125.50
}
```

### Ocupación (OccupancyChart)
```json
{
  "total": 100,
  "available": 24,
  "occupied": 45,
  "maintenance": 15,
  "cleaning": 5
}
```

### Reserva (UpcomingReservations)
```json
{
  "id": 1,
  "checkInDate": "2024-04-22",
  "checkOutDate": "2024-04-25",
  "numberOfGuests": 2,
  "totalPrice": 450.00,
  "status": "Confirmada",
  "room": { "roomNumber": "101", "type": "Doble" },
  "user": { "name": "Juan García", "email": "juan@example.com" }
}
```

### Habitación (AvailableRooms)
```json
{
  "id": 1,
  "roomNumber": "101",
  "type": "Doble",
  "capacity": 2,
  "pricePerNight": 125.50,
  "status": "Disponible"
}
```

---

## 🎯 Flujo de Usuario

1. **Inicio de Sesión** → Acceso a Dashboard
2. **Carga**: Muestra animación de carga mientras obtiene datos
3. **Visualización**: Muestra datos organizados en secciones
4. **Interacción**: Puede filtrar habitaciones por estado
5. **Auto-Refresh**: Actualización automática cada 5 minutos

---

## 📈 Ventajas del Nuevo Dashboard

✅ **Moderno**: Diseño contemporáneo con gradientes y efectos modernos
✅ **Intuitivo**: Información clara y bien organizada
✅ **Rápido**: Carga optimizada y responsiva
✅ **Informativo**: KPIs clave en un vistazo
✅ **Seguro**: Protegido con autenticación
✅ **Accesible**: Responsivo en todos los dispositivos
✅ **Tiempo Real**: Actualización automática de datos
✅ **Interactivo**: Filtros y opciones de visualización

---

## 🔧 Mantenimiento

### Para actualizar el diseño:
1. Modificar estilos en el objeto `styles` de cada componente
2. Cambiar colores en la paleta de colores
3. Ajustar animaciones en `@keyframes`

### Para agregar nuevas métricas:
1. Editar DashboardStats.tsx
2. Agregar nuevas tarjetas al grid
3. Conectar con el endpoint de API correspondiente

### Para cambiar el auto-refresh:
```typescript
// En dashboard.tsx, cambiar el intervalo de 5 minutos (300000 ms)
setInterval(() => window.location.reload(), 5 * 60 * 1000)
```
