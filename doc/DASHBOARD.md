# Dashboard - Panel de Control

## Descripción

Panel de control (dashboard) moderno y en tiempo real que proporciona una visión completa del estado del hotel. Muestra estadísticas clave, ocupación actual, próximas reservas y estado de las habitaciones en una interfaz intuitiva y responsiva.

## Características

- ✅ Estadísticas en tiempo real (habitaciones, reservas, ingresos)
- ✅ Gráfico interactivo de ocupación
- ✅ Lista de próximas reservas con alertas
- ✅ Filtrado de habitaciones por estado
- ✅ Auto-actualización cada 5 minutos
- ✅ Información del usuario autenticado
- ✅ Diseño responsivo y moderno
- ✅ Indicadores de urgencia (HOY, PRONTO)

## Componentes

### DashboardStats
Muestra 6 tarjetas principales con información crítica del hotel:

| Métrica | Descripción | Color |
|---------|-------------|-------|
| Disponibles | Habitaciones disponibles para reserva | Verde |
| Ocupadas | Habitaciones actualmente ocupadas | Azul |
| Reservas Activas | Reservas confirmadas | Púrpura |
| En Mantenimiento | Habitaciones no disponibles | Naranja |
| Ingresos Totales | Ingresos acumulados de reservas | Dorado |
| Precio Promedio | Precio medio por noche | Índigo |

**Cálculos:**
- Ocupación % = (Ocupadas / Total) × 100
- Todos los datos se actualizan en tiempo real
- Los ingresos excluyen reservas canceladas

### OccupancyChart
Gráfico de ocupación con visualización de estado de habitaciones:

**Elementos:**
- Barra horizontal de ocupación general
- 4 tarjetas detalladas: ocupadas, disponibles, limpieza, mantenimiento
- Mini-gráficos de barras para cada estado
- Resumen con tasa de ocupación

**Datos mostrados:**
- Ocupación actual (%)
- Cantidad por estado
- Desglose visual con colores

### AvailableRooms
Lista interactiva de habitaciones filtrada por estado:

**Filtros disponibles:**
- Disponible
- Ocupada
- Limpieza
- Mantenimiento

**Información por habitación:**
- Número de habitación
- Tipo (Individual, Doble, Triple, Suite)
- Capacidad de huéspedes
- Precio por noche
- Badge con estado y color

### UpcomingReservations
Lista de las 10 próximas reservas confirmadas con alertas visuales:

**Información mostrada:**
- Fechas de entrada y salida
- Número de noches
- Número de habitación
- Tipo de habitación
- Cantidad de huéspedes
- Nombre del cliente
- Precio total
- Badge con urgencia (HOY, PRONTO, PRÓXIMA)

**Alertas:**
- **HOY** (fondo amarillo) - Check-in hoy
- **PRONTO** (fondo naranja) - Check-in en próximos 3 días
- **PRÓXIMA** (gris) - Otras reservas

## Diseño y UI

### Paleta de Colores

```
Verde (#28a745)     - Disponibilidad
Azul (#007bff)      - Ocupación
Púrpura (#6f42c1)   - Reservas activas
Naranja (#fd7e14)   - Mantenimiento/Alertas
Dorado (#ffc107)    - Ingresos/Importante
Índigo (#3f51b5)    - Precio promedio
Oscuro (#132a3a)    - Fondo, textos primarios
```

### Responsividad

- **Desktop** - Grid de 6 columnas para estadísticas, 2 columnas para próximas reservas y habitaciones
- **Tablet** - Ajuste automático a 3-4 columnas
- **Mobile** - Stack vertical (1 columna)

### Tipografía

- Títulos principales: 1.8rem, bold
- Títulos secundarios: 1.1rem, bold
- Valores: 2.2rem, bold
- Subtítulos: 0.95rem, normal
- Etiquetas: 0.9rem, normal

## Flujo de Datos

```
Dashboard Page
├── DashboardStats (Fetch /rooms/statistics, /reservations/statistics)
├── OccupancyChart (Fetch /rooms/statistics)
├── UpcomingReservations (Fetch /reservations?status=Confirmada)
└── AvailableRooms (Fetch /rooms?status=<selected>)
```

## Endpoints Utilizados

### Estadísticas de Habitaciones
```http
GET /api/rooms/statistics
```

Retorna:
- total: número total de habitaciones
- statusCounts: { Disponible, Ocupada, Limpieza, Mantenimiento }
- typeCounts: { Individual, Doble, Triple, Suite }
- averagePrice: precio promedio por noche

### Estadísticas de Reservas
```http
GET /api/reservations/statistics
```

Retorna:
- total: número total de reservas
- byStatus: { Pendiente, Confirmada, Cancelada, Completada }
- totalRevenue: ingresos totales

### Listado de Reservas
```http
GET /api/reservations?status=Confirmada
```

Retorna array ordenado de reservas confirmadas

### Habitaciones por Estado
```http
GET /api/rooms?status=<estado>
```

Retorna array de habitaciones filtradas por estado

## Comportamiento

### Auto-actualización

- **Inicial**: Los datos se cargan al abrir el dashboard
- **Periódica**: Auto-refresh cada 5 minutos
- **Manual**: Los componentes tienen botón de actualizar (cuando se implementen)
- **User-triggered**: El usuario puede hacer refresh manualmente en el navegador

### Indicadores de Carga

- Cada sección muestra "Cargando..." mientras obtiene datos
- Los errores se muestran con fondo rojo y mensaje descriptivo
- Las secciones son independientes (si una falla, las otras funcionan)

### Alertas y Badges

- **HOY**: Check-in el día actual (fondo amarillo #ffc107)
- **PRONTO**: Check-in en 1-3 días (fondo naranja #fd7e14)
- **PRÓXIMA**: Otras reservas (gris)
- Los colores de ocupación por tipo de habitación son consistentes

## Acceso

- **Ruta**: `/dashboard`
- **Acceso**: Protegido (requiere autenticación)
- **Roles permitidos**: Todos (SuperAdmin, Recepción, Cliente)
- **Visible en NavBar**: Sí, como primer enlace
- **Visible en Home**: Sí, como tarjeta principal

## Casos de Uso

### Recepción
- Verificar habitaciones disponibles para check-in
- Ver próximas llegadas de huéspedes
- Monitorear estado de habitaciones
- Generar informes de ocupación

### SuperAdmin
- Obtener visión general del hotel
- Monitorear ingresos y precios promedio
- Verificar estadísticas de reservas
- Controlar mantenimiento de habitaciones

### Cliente
- Ver sus próximas reservas
- Conocer disponibilidad de habitaciones
- Monitorear estado del hotel

## Mejoras Futuras

- [ ] Gráficos animados con Chart.js
- [ ] Exportación de reportes a PDF
- [ ] Predicción de ocupación con IA
- [ ] Comparativas de períodos
- [ ] Notificaciones de check-in/check-out
- [ ] Historial de ocupación por días
- [ ] Ingresos por tipo de habitación
- [ ] Análisis de tendencias

## Ejemplo de Uso

**Visitar el Dashboard:**
```
1. Hacer login en el sistema
2. Hacer clic en "Dashboard" en la navegación
3. Ver estadísticas en tiempo real
4. Filtrar habitaciones por estado
5. Revisar próximas reservas
```

## Notas Técnicas

- Los datos se obtienen de endpoints públicos (excepto estadísticas)
- El componente ProtectedRoute asegura que solo usuarios autenticados accedan
- Cada componente maneja su propio estado de carga y error
- Las llamadas a API se hacen en paralelo para mejor rendimiento
- El auto-refresh puede desactivarse si hay conexión lenta

## Performance

- Carga inicial: ~2-3 segundos (dependiendo del servidor)
- Renderizado: Componentes optimizados con React hooks
- API calls: Parallelizadas para rapidez
- Grid responsivo: CSS nativo sin librerías externas
- Tamaño del bundle: Minimal (sin Chart.js u otro extra)
