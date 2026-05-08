# Guía de Desarrollo y Mantenimiento del Dashboard

## 📝 Código Limpio y Consistencia

### Convenciones de Nombres

#### Componentes
```typescript
// ✅ CORRECTO
function DashboardStats() { }
function OccupancyChart() { }
function UpcomingReservations() { }

// ❌ INCORRECTO
function dashboardstats() { }
function occupancyChart() { }
function upcoming_reservations() { }
```

#### Variables y Estados
```typescript
// ✅ CORRECTO
const [stats, setStats] = useState({...})
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

// ❌ INCORRECTO
const [stat, setStat] = useState({...})
const [isLoading, setIsLoading] = useState(true)  // Para booleanos está OK
const [err, setErr] = useState('')
```

#### Estilos
```typescript
// ✅ CORRECTO
const styles = {
  container: { ... } as React.CSSProperties,
  header: { ... } as React.CSSProperties,
  title: { ... } as React.CSSProperties,
} as const

// ❌ INCORRECTO
const styles = {
  cont: { ... },
  hdr: { ... },
  ttl: { ... },
}
```

---

## 🏗️ Estructura de Componente Ideal

```typescript
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface DataType {
  field1: string
  field2: number
  // ...
}

export default function ComponentName() {
  // 1. Estados
  const [data, setData] = useState<DataType>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 2. Efectos
  useEffect(() => {
    fetchData()
  }, [])

  // 3. Funciones
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/endpoint')
      setData(response.data)
      setError('')
    } catch (err) {
      console.error('Error:', err)
      setError('Mensaje de error amigable')
    } finally {
      setLoading(false)
    }
  }

  // 4. Renderización condicional
  if (loading) {
    return <div style={styles.loading}>Cargando...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  // 5. Render principal
  return (
    <div style={styles.container}>
      {/* Contenido aquí */}
    </div>
  )
}

// 6. Estilos al final
const styles = {
  container: { ... } as React.CSSProperties,
  loading: { ... } as React.CSSProperties,
  error: { ... } as React.CSSProperties,
} as const
```

---

## 🎨 Guía de Estilos CSS

### Espaciado Estándar
```typescript
// Márgenes y paddings
padding: '1rem'      // 16px (contenido interno)
padding: '1.5rem'    // 24px (secciones)
padding: '2rem'      // 32px (contenedor principal)

margin: '0.5rem'     // 8px (pequeño)
margin: '1rem'       // 16px (normal)
margin: '1.5rem'     // 24px (grande)
margin: '2rem'       // 32px (muy grande)
```

### Bordes y Esquinas
```typescript
borderRadius: '6px'    // Botones y pequeños elementos
borderRadius: '12px'   // Cards y componentes
borderRadius: '16px'   // Componentes grandes
borderRadius: '20px'   // Pills (botones redondeados)
```

### Sombras Estándar
```typescript
// Sombra suave (para cards normales)
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'

// Sombra mediana (para cards principales)
boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'

// Sombra profunda (para modales/overlays)
boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'

// Con efecto hover
boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
```

### Tipografía
```typescript
// Encabezados
fontSize: '1.5rem'  // h2, 24px
fontSize: '2rem'    // h1, 32px
fontSize: '2.5rem'  // números grandes

// Cuerpo
fontSize: '1rem'    // Texto normal, 16px
fontSize: '0.95rem' // Texto pequeño
fontSize: '0.9rem'  // Texto más pequeño
fontSize: '0.85rem' // Subtítulo
fontSize: '0.75rem' // Badges, etiquetas

// Pesos
fontWeight: 400     // Normal
fontWeight: 500     // Medio
fontWeight: 600     // Semibold
fontWeight: 700     // Bold
fontWeight: 800     // Extra Bold (números)
```

### Transiciones
```typescript
// Rápida
transition: 'all 0.2s ease'

// Normal (predeterminada)
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

// Lenta
transition: 'all 0.5s ease'

// Solo propiedades específicas
transition: 'color 0.3s, background 0.3s'
```

---

## 🎯 Patrones de Código Recomendados

### Patrón 1: Efecto con Hover
```typescript
const styles = {
  card: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    // Estado base
  } as React.CSSProperties,
  // Aplicar manualmente en JSX para hover
}

// En JSX:
<div 
  style={styles.card}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
>
</div>
```

### Patrón 2: Condicional de Estilos
```typescript
<div style={{
  ...styles.item,
  ...(isToday ? styles.itemHighlight : {}),
  ...(isError ? styles.itemError : {}),
}}>
  Contenido
</div>
```

### Patrón 3: Mapping de Arrays
```typescript
{data.map((item) => (
  <div key={item.id} style={styles.gridItem}>
    {item.name}
  </div>
))}
```

### Patrón 4: Manejo de Estados
```typescript
const [state, setState] = useState({
  data: [],
  loading: true,
  error: '',
})

// Actualizar sin perder otros campos
setState(prev => ({
  ...prev,
  loading: false,
}))
```

---

## 🔍 Control de Calidad

### ESLint Rules a Seguir
```javascript
// Usar const en lugar de let
const x = 1  // ✅
let x = 1    // ❌ (a menos que sea necesario)

// Evitar console.log en producción
console.log('debug')  // ❌ (solo desarrollo)
console.error('error') // ✅ (mantener errores)

// Usar tipos TypeScript
interface User {
  id: number
  name: string
}

const user: User = { ... }  // ✅
const user = { ... }         // ⚠️ (sin tipo)
```

### Checklist antes de Commit
```
[ ] No hay console.log() (excepto errores)
[ ] TypeScript sin errores (npm run lint)
[ ] Componente se renderiza sin warnings
[ ] Estilos son consistentes con el tema
[ ] No hay variables sin usar
[ ] Funciones están bien nombradas
[ ] Comentarios útiles en código complejo
[ ] Testing completado (si corresponde)
```

---

## 📦 Dependencias y Librerías

### Instaladas
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "typescript": "^5.0.0"
}
```

### NO INSTALAR (usar alternativas)
```
❌ styled-components (usamos CSS-in-JS)
❌ chart.js (usamos SVG)
❌ moment.js (usamos Date nativo)
❌ lodash (usar métodos nativos)
❌ jQuery (no necesario con React)
```

### Agregar si es necesario
```bash
# Gráficos avanzados
npm install recharts

# Animaciones
npm install framer-motion

# Fechas
npm install date-fns

# Formularios
npm install react-hook-form
```

---

## 🧪 Testing

### Tests Manuales Básicos
```typescript
// 1. Test de carga
describe('DashboardStats', () => {
  test('debe cargar estadísticas', () => {
    // Renderizar componente
    // Esperar elementos
    // Verificar valores
  })
})

// 2. Test de error
test('debe mostrar error cuando falla API', () => {
  // Mock API error
  // Renderizar
  // Verificar mensaje de error
})

// 3. Test de interacción
test('debe filtrar habitaciones', () => {
  // Renderizar
  // Click en filtro
  // Verificar que datos cambien
})
```

---

## 🚀 Optimizaciones Recomendadas

### 1. Lazy Loading
```typescript
// Para componentes grandes
const OccupancyChart = dynamic(() => import('../components/OccupancyChart'))
```

### 2. Memoización
```typescript
import { memo } from 'react'

const StatCard = memo(({ stat }) => {
  return <div>{stat.value}</div>
})

export default StatCard
```

### 3. Separación de Responsabilidades
```typescript
// ❌ Todo junto
function Dashboard() {
  // Obtener datos
  // Procesar datos
  // Renderizar
}

// ✅ Separado
function useStatistics() { /* custom hook */ }
function StatCard() { /* componente presentación */ }
function Dashboard() { /* orquestra */ }
```

---

## 📚 Documentación de Código

### Comentarios Útiles
```typescript
// ✅ ÚTIL - Explica el por qué
// Ordenar por fecha para mostrar reservas más próximas primero
const sorted = reservations.sort((a, b) => 
  new Date(a.checkInDate) - new Date(b.checkInDate)
)

// ❌ INNECESARIO - Repite lo obvio
// Incrementar contador
counter++
```

### JSDoc para Funciones Complejas
```typescript
/**
 * Calcula el porcentaje de ocupación del hotel
 * @param {number} occupied - Habitaciones ocupadas
 * @param {number} total - Total de habitaciones
 * @returns {number} Porcentaje de 0 a 100
 */
function calculateOccupancy(occupied: number, total: number): number {
  return total > 0 ? Math.round((occupied / total) * 100) : 0
}
```

---

## 🔗 Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Hotel Reservations"
```

```typescript
// Usar en código
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

---

## 🎓 Mejores Prácticas Finales

1. **KISS** (Keep It Simple, Stupid)
   - Código simple es más mantenible
   - Evita sobre-ingenierización

2. **DRY** (Don't Repeat Yourself)
   - Reutiliza componentes
   - Extrae funciones comunes

3. **SOLID**
   - Single Responsibility
   - Open/Closed Principle
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

4. **Performance First**
   - Mide antes de optimizar
   - Usa React DevTools Profiler
   - Evita renders innecesarios

5. **Seguridad**
   - Nunca expongas tokens en el cliente
   - Sanitiza inputs
   - Valida datos del servidor

6. **Accesibilidad**
   - Usa etiquetas semánticas (h1, h2, etc.)
   - Colores con suficiente contraste
   - Proporciona alt text para imágenes

---

## 📞 Recursos Útiles

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

**Versión**: 1.0
**Última actualización**: Abril 2026
**Mantenedor**: Equipo de Desarrollo
