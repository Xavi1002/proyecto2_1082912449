# Dashboard - Guía Rápida de Referencia

## 🚀 Inicio Rápido

### Para Ver el Dashboard
1. Asegúrate de tener el servidor backend ejecutándose
2. Inicia el frontend con `npm run dev`
3. Ve a `http://localhost:3000/dashboard`
4. El dashboard carga automáticamente con datos actuales

### Características Principales en un Vistazo

| Sección | Qué Muestra | Actualización |
|---------|------------|--------------|
| **Estadísticas** | 6 KPIs principales | Automática cada 5 min |
| **Ocupación** | Gráfico circular + barras | En vivo |
| **Próximas Reservas** | 10 reservas más cercanas | Automática cada 5 min |
| **Habitaciones** | Listado filtrable por estado | Automática cada 5 min |

---

## 🎨 Guía de Estilos

### Si quieres modificar colores:

**Archivo**: Cada componente tiene su propio `const styles`

**Cambios más comunes**:
```typescript
// Cambiar color de tarjeta
cardGreen: { borderTopColor: '#10b981' } // Cambiar a otro verde

// Cambiar color de fondo
main: { background: 'new-gradient' } // En dashboard.tsx

// Cambiar sombra
boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' // Más sombra = más oscuro
```

### Paleta de Colores Estándar
```
Verde:   #10b981  (Disponible, Positivo)
Azul:    #3b82f6  (Activo, Principal)
Naranja: #f97316  (Atención, Mantenimiento)
Rojo:    #ef4444  (Urgente, Pronto)
Amarillo:#eab308  (Importante, Hoy)
Cian:    #06b6d4  (Info, Limpieza)
Gris:    #999, #666, #e5e7eb (Neutral)
```

---

## 📱 Breakpoints Responsivos

```typescript
Móvil:  < 640px   → 1 columna, stack vertical
Tablet: 640-1024  → 2 columnas, grid adaptado
Desktop: > 1024px → 3+ columnas, layout completo
```

---

## ⚡ Animaciones Disponibles

### Usar animación slideIn
```css
animation: 'slideIn 0.6s ease-out forwards'
```

### Usar animación pulse
```css
animation: 'pulse 2s infinite'
```

### Usar animación gradient (fondo)
```css
animation: 'gradient 15s ease infinite'
backgroundSize: '400% 400%'
```

---

## 🔧 Cambios Frecuentes

### 1. Cambiar intervalo de auto-refresh
**Archivo**: `dashboard.tsx`
```typescript
// De: 5 * 60 * 1000 (5 minutos)
// A:  3 * 60 * 1000 (3 minutos)
setInterval(() => window.location.reload(), 3 * 60 * 1000)
```

### 2. Cambiar cantidad de reservas mostradas
**Archivo**: `UpcomingReservations.tsx`
```typescript
// De: slice(0, 10)
// A:  slice(0, 5)  ← Mostrar solo 5
setReservations(sorted.slice(0, 5))
```

### 3. Agregar nueva métrica a estadísticas
**Archivo**: `DashboardStats.tsx`
```typescript
// 1. Agregar al estado
const [stats, setStats] = useState({
  totalRooms: 0,
  // ... existentes ...
  newMetric: 0,  // ← Nuevo
})

// 2. Agregar tarjeta
<div style={{ ...styles.card, ...styles.cardNewColor }}>
  <div style={styles.cardHeader}>
    <h3 style={styles.cardTitle}>Nueva Métrica</h3>
    <span style={styles.icon}>📊</span>
  </div>
  <p style={styles.cardValue}>{stats.newMetric}</p>
</div>

// 3. Definir color en estilos
cardNewColor: {
  borderTopColor: '#6366f1',
  borderTop: '4px solid #6366f1',
}
```

### 4. Cambiar emojis
**Busca el emoji en el componente y reemplaza**:
```tsx
// De:
<span style={styles.icon}>🟢</span>
// A:
<span style={styles.icon}>✅</span>
```

---

## 🐛 Solución de Problemas Comunes

### Problema: Los datos no cargan
**Solución**:
1. Abre la consola (F12)
2. Busca errores de red
3. Verifica que el backend esté ejecutándose
4. Comprueba que los endpoints existan

### Problema: Estilos no aparecen
**Solución**:
1. Limpia caché: Ctrl+Shift+Delete
2. Recarga: Ctrl+Shift+R
3. Verifica que no haya errores de TypeScript

### Problema: Dashboard se carga lento
**Solución**:
1. Verifica el performance en DevTools (Network)
2. Reduce la cantidad de datos (ej: menos reservas)
3. Aumenta el intervalo de auto-refresh

### Problema: Filtros no funcionan
**Solución**:
1. Abre console (F12)
2. Verifica que el endpoint `/rooms` responda
3. Comprueba que el estado cambie (React DevTools)

---

## 📚 Documentación por Componente

| Componente | Archivo | Responsabilidades |
|-----------|---------|------------------|
| **Dashboard** | `dashboard.tsx` | Layout principal, encabezado, pie |
| **DashboardStats** | `DashboardStats.tsx` | 6 KPIs principales |
| **OccupancyChart** | `OccupancyChart.tsx` | Gráficos de ocupación |
| **UpcomingReservations** | `UpcomingReservations.tsx` | Listado de reservas |
| **AvailableRooms** | `AvailableRooms.tsx` | Listado filtrable de habitaciones |

---

## 🔐 Seguridad

- ✅ Dashboard protegido con ProtectedRoute
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Datos limitados según permisos
- ✅ No hay datos sensibles expuestos

---

## 📊 Endpoints API Requeridos

```bash
GET  /rooms/statistics          # Para DashboardStats y OccupancyChart
GET  /reservations/statistics   # Para DashboardStats
GET  /reservations?status=...   # Para UpcomingReservations
GET  /rooms?status=...          # Para AvailableRooms
```

---

## ✅ Checklist Pre-Deploy

- [ ] Todos los componentes se cargan
- [ ] No hay errores en console (F12)
- [ ] Los datos se muestran correctamente
- [ ] Filtros funcionan
- [ ] Animaciones son suaves
- [ ] Responsividad OK en móvil/tablet/desktop
- [ ] Auto-refresh funciona
- [ ] Emojis se muestran correctamente
- [ ] Colores se ven bien
- [ ] Performance es acceptable

---

## 💻 Stack Técnico

```
Frontend:     Next.js 14 + React 18 + TypeScript
Estilos:      CSS-in-JS (inline styles)
API:          Axios HTTP client
Animaciones:  CSS keyframes (sin librerías)
Gráficos:     SVG nativo (sin Chart.js)
```

---

## 🎯 Métricas de Éxito

- ✅ Dashboard carga en < 2 segundos
- ✅ Todos los KPIs visibles en viewport inicial (sin scroll)
- ✅ Filtros responden en < 500ms
- ✅ Auto-refresh sin impacto visual
- ✅ 0 errores de console
- ✅ 100% responsive (mobile-first)

---

## 📞 Recursos

- **Documentación Completa**: `DASHBOARD_MODERNO.md`
- **Guía Visual**: `GUIA_VISUAL_DASHBOARD.md`
- **Testing**: `TESTING_DASHBOARD.md`
- **Cambios Realizados**: `RESUMEN_CAMBIOS_DASHBOARD.md`

---

## 🚀 Próximas Mejoras Recomendadas

1. **Corto Plazo (1-2 semanas)**
   - [ ] Exportar datos a PDF
   - [ ] Dark mode
   - [ ] Notificaciones en vivo

2. **Medio Plazo (1-2 meses)**
   - [ ] Gráficos históricos (7/30 días)
   - [ ] Reportes customizables
   - [ ] Alertas automáticas

3. **Largo Plazo (3+ meses)**
   - [ ] Analytics avanzado
   - [ ] Machine learning para precios
   - [ ] Integraciones externas

---

**Última actualización**: Abril 2026
**Versión**: 1.0 (Dashboard Moderno)
**Estado**: ✅ Producción
