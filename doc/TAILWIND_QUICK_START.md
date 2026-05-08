# 🎨 Tailwind CSS - Quick Start

> Guía rápida para entender y usar el nuevo diseño

---

## ⚡ En 2 Minutos

### Lo que se instaló:
✅ **Tailwind CSS v3** - Framework CSS utility-first  
✅ **PostCSS** - Procesador de CSS  
✅ **Autoprefixer** - Compatibilidad automática  

### Archivos nuevos:
```
frontend/
├── tailwind.config.js      (Configuración)
├── postcss.config.js       (PostCSS config)
├── src/styles/
│   └── globals.css         (Estilos globales)
└── src/pages/
    ├── _app.tsx            (Importa globals.css)
    ├── login.tsx           (Rediseñado)
    └── dashboard.tsx       (Rediseñado)
```

---

## 🚀 Ejecutar el Proyecto

### 1. Instalar (YA HECHO)
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
```

### 2. Desarrollar
```bash
npm run dev
```
Abre `http://localhost:3000`

### 3. Compilar (Producción)
```bash
npm run build
npm start
```

**¡Listo!** Los estilos de Tailwind se procesarán automáticamente.

---

## 🎯 Cómo Funciona Tailwind

### Antes (Inline styles):
```tsx
<button style={{ 
  backgroundColor: '#0284c7',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
}}>
  Click aquí
</button>
```

### Después (Tailwind):
```tsx
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg">
  Click aquí
</button>
```

**Ventajas**:
- ✅ Más legible
- ✅ Consistencia automática
- ✅ Cambios rápidos
- ✅ Componentes reutilizables

---

## 🎨 Clases Más Comunes

### Colores
```tsx
// Fondo
className="bg-slate-900"     // Oscuro
className="bg-primary-600"   // Azul

// Texto
className="text-white"       // Blanco
className="text-slate-700"   // Oscuro

// Bordes
className="border border-slate-300"
```

### Espaciado
```tsx
// Padding (interno)
className="p-4"      // Todos lados
className="px-4"     // Horizontal
className="py-2"     // Vertical
className="pt-4"     // Solo arriba

// Margin (externo)
className="m-4"
className="mb-8"     // Margin bottom
className="mt-2"     // Margin top
```

### Tamaño
```tsx
className="w-full"          // Ancho completo
className="max-w-md"        // Máximo ancho
className="h-64"            // Alto
className="min-h-screen"    // Mínimo alto (pantalla)
```

### Texto
```tsx
className="text-lg"         // Grande
className="font-bold"       // Negrita
className="uppercase"       // Mayúsculas
className="text-center"     // Alineado
```

### Flexbox
```tsx
className="flex"                    // Activar flex
className="flex-col"                // Dirección columna
className="justify-between"         // Distribuir
className="items-center"            // Alinear vertically
className="gap-4"                   // Espacio entre items
```

### Grid
```tsx
className="grid"
className="grid-cols-2"             // 2 columnas
className="grid-cols-1 lg:grid-cols-2"  // Responsive
className="gap-4"                   // Espacio
```

### Hover y Estados
```tsx
className="hover:bg-blue-700"       // En hover
className="focus:ring-2"            // En focus
className="disabled:opacity-50"     // Deshabilitado
className="transition-colors"       // Transición
```

---

## 💡 Componentes Personalizados

### Botón Primario
```tsx
<button className="btn-primary">
  Aceptar
</button>
```

**Equivalente sin componente**:
```tsx
<button className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500">
  Aceptar
</button>
```

### Card
```tsx
<div className="card">
  <h3>Título</h3>
  <p>Contenido</p>
</div>
```

**Equivalente**:
```tsx
<div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
  <h3>Título</h3>
  <p>Contenido</p>
</div>
```

### Input
```tsx
<input className="input-field" />
```

**Equivalente**:
```tsx
<input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all" />
```

---

## 📱 Responsive (Adaptable)

### Sintaxis
```tsx
className="
  text-lg              // Por defecto
  sm:text-xl           // En tablets (640px+)
  md:text-2xl          // En tablets grandes (768px+)
  lg:text-3xl          // En desktop (1024px+)
"
```

### Ejemplo Real (Dashboard):
```tsx
<div className="
  grid
  grid-cols-1          // 1 columna en móvil
  md:grid-cols-2       // 2 columnas en tablet
  lg:grid-cols-3       // 3 columnas en desktop
  gap-4
">
  <Card />
  <Card />
  <Card />
</div>
```

### Breakpoints
| Prefijo | Ancho | Dispositivo |
|---------|-------|------------|
| (none) | 0px | Móvil |
| `sm:` | 640px | Tablet |
| `md:` | 768px | Tablet grande |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop grande |

---

## 🎭 Gradientes y Efectos

### Gradientes
```tsx
// Horizontal
className="bg-gradient-to-r from-primary-600 to-primary-700"

// Diagonal
className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900"
```

### Sombras
```tsx
className="shadow"          // Sutil
className="shadow-lg"       // Grande
className="shadow-xl"       // Extra grande
className="shadow-card"     // Personalizada
```

### Transiciones
```tsx
className="transition"              // Todas las propiedades
className="transition-colors"       // Solo colores
className="transition-all duration-200"  // Con duración
```

### Blur y Backdrop
```tsx
className="blur"                    // Desenfoque
className="backdrop-blur-lg"        // Vidrio frosted
className="bg-white/10"             // Transparencia
```

---

## 🎨 Colores Disponibles

### Primarios (Azul)
```
primary-500  → #0ea5e9  ← Usa este para acciones
primary-600  → #0284c7  ← Hover
primary-700  → #0369a1  ← Active
```

### Neutrales (Gris)
```
slate-50   → #f8fafc  (muy claro)
slate-500  → #64748b  (neutro)
slate-900  → #0f172a  (muy oscuro)
```

### Estados
```
green-500   → éxito / activo
yellow-500  → advertencia / pendiente
red-500     → error / cancelado
blue-500    → info
```

---

## 📝 Ejemplos de Código Real

### Navbar
```tsx
<nav className="bg-slate-900 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
    <Link href="/" className="text-white font-bold">Logo</Link>
    <button className="btn-primary">Login</button>
  </div>
</nav>
```

### Form
```tsx
<form className="space-y-6">
  <div>
    <label className="form-label">Email</label>
    <input className="input-field" type="email" />
  </div>
  
  <button className="btn-primary w-full">
    Enviar
  </button>
</form>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="card">
      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
      <p className="text-slate-600">{item.description}</p>
    </div>
  ))}
</div>
```

---

## 🆘 Troubleshooting

### Problema: Los estilos no se aplican
**Solución**: Asegúrate que el archivo esté en `src/pages/**` o `src/components/**`

### Problema: El color no es el esperado
**Solución**: Usa números válidos (50, 100, 200, ... 900)
```tsx
bg-primary-600  ✅ Correcto
bg-primary-5    ❌ Incorrecto
```

### Problema: Mobile se ve raro
**Solución**: Usa mobile-first approach
```tsx
className="text-sm md:text-lg lg:text-2xl"
```

### Problema: Las animaciones no funcionan
**Solución**: Las animaciones están en `src/styles/globals.css`

---

## 📚 Referencias Rápidas

### Clases Comunes Agrupadas
```tsx
// Button-like
className="px-4 py-2 rounded-lg font-semibold transition-colors"

// Card-like
className="bg-white rounded-lg shadow p-4 hover:shadow-lg"

// Input-like
className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2"

// Text Sizes
className="text-xs text-sm text-base text-lg text-xl text-2xl"

// Spacing
className="p-2 p-4 p-6 p-8"  // padding
className="m-2 m-4 m-6 m-8"  // margin
className="gap-2 gap-4 gap-6 gap-8"  // gap
```

---

## 🚀 Próxima Lectura

1. **DISENO_UI_TAILWIND.md** - Detalles técnicos completos
2. **DISENO_UI_VISUAL.md** - Visualización de componentes
3. **Tailwind CSS Docs** - https://tailwindcss.com/docs

---

## ✨ Resumen

- ✅ Tailwind CSS instalado y configurado
- ✅ Estilos globales en `src/styles/globals.css`
- ✅ Componentes CSS personalizados (btn, card, input, etc.)
- ✅ Login rediseñado con glassmorphism
- ✅ Dashboard rediseñado con grid responsivo
- ✅ NavBar modernizado

**¡Listo para desarrollar!** 🚀

---

**Última actualización**: 22 de Abril, 2026  
**Versión**: 1.0  
**Estado**: ✅ LISTO
