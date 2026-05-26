# Spec — HotelManager Pro UI 2.0

> Fecha: 2026-05-25
> Estado: aprobado para implementación
> Alcance: rediseño visual completo del frontend. Lógica de negocio, endpoints y conexión a Supabase intactos.

---

## 1. Contexto

El sistema funcional está completo (todas las fases del Plan Maestro figuran cerradas en `doc/ESTADO_EJECUCION_HOTELMANAGER.md`). La capa visual es incoherente: el login usa glass-morphism con blobs animados, el dashboard usa CSS vars `--hm-*` propias, la sidebar usa `lucide-react`, varias páginas (`clients.tsx` 245 líneas, `users.tsx` 441 líneas) tienen estilos inline ad-hoc. No hay sistema de design tokens ni librería de componentes compartidos.

Este spec define el rediseño de la capa visual al lenguaje **"Hotel premium minimal"** confirmado con el usuario, manteniendo intacta toda la lógica de negocio.

## 2. Objetivos

1. Un único lenguaje visual coherente en todas las pantallas.
2. Sistema de design tokens (colores, tipografía, espaciado, radios, sombras) en CSS vars + extensión Tailwind.
3. Librería interna de componentes UI compartidos (`src/components/ui/`).
4. Iconografía SVG inline propia. **Eliminar la dependencia `lucide-react`.**
5. Tipografía con `next/font` para evitar FOUT.
6. Cero cambios en backend, endpoints, modelos, middleware, ni en `lib/api.ts` / `lib/useAuth.ts`.

## 3. No-objetivos

- No migrar a App Router (seguimos Pages Router).
- No agregar tests automatizados de UI.
- No tocar lógica de negocio, modelos Sequelize, o RN-02..RN-09.
- No rediseñar emails / PDFs / exports (no existen).
- No agregar librerías de componentes externas (Radix, shadcn, MUI). Todo a mano sobre Tailwind v3.

## 4. Sistema visual

### 4.1 Paleta

| Token | Valor | Uso |
|---|---|---|
| `--sand-50` | `#FAF7F2` | Fondo principal de páginas |
| `--sand-100` | `#F2EDE3` | Surfaces secundarias, item activo de sidebar |
| `--sand-200` | `#E8E1D5` | Bordes neutros, dividers |
| `--ink-900` | `#1B2A4E` | Texto headline, panel marca del login |
| `--ink-700` | `#2F3F66` | Botón primario hover |
| `--ink-500` | `#5B6788` | Texto secundario |
| `--ink-400` | `#8290AC` | Placeholder, iconos muted |
| `--copper-500` | `#B8743D` | Acento (barra de item activo, links) |
| `--copper-600` | `#9A5E2E` | Hover de acentos |
| `--success-500` | `#3E8E5A` | Badge "disponible", "confirmada" |
| `--warning-500` | `#B8843D` | Badge "mantenimiento" |
| `--danger-500` | `#B0463E` | Badge "ocupada"/"cancelada", errores |
| `--white` | `#FFFFFF` | Cards, inputs |

### 4.2 Tipografía

- **Fraunces** (Google Fonts, vía `next/font/google`) — serif. Pesos: 400, 500, 600. Uso: titulares `h1`/`h2`, KPI grandes, logo.
- **Inter** (Google Fonts, vía `next/font/google`) — sans. Pesos: 400, 500, 600. Uso: todo el resto.
- Escalas: `text-xs` 12px, `text-sm` 14px, `text-base` 16px, `text-lg` 18px, `text-xl` 20px, `text-2xl` 24px, `text-3xl` 30px, `text-4xl` 36px, `text-5xl` 48px.

### 4.3 Espaciado, radios, sombras

- Espaciado: escala Tailwind por defecto (`p-4`, `p-6`, `p-8`).
- Radios: `rounded-md` 6px (botones, inputs), `rounded-xl` 12px (cards), `rounded-full` (chips, avatars).
- Sombras: `shadow-paper` = `0 1px 2px rgba(27,42,78,0.04), 0 1px 1px rgba(27,42,78,0.03)`. Una sombra única para toda la UI. No usar sombras Tailwind default.
- Borde estándar: `1px solid var(--sand-200)`.

## 5. Arquitectura de archivos

```
src/
├── styles/
│   ├── globals.css           ← @tailwind + reset
│   └── tokens.css            ← variables CSS (paleta + tipografía)
├── components/
│   ├── icons.tsx             ← export de iconos SVG inline (un componente por icono)
│   ├── ui/                   ← NUEVO: componentes compartidos
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── EmptyState.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx     ← refactor visual
│   │   ├── Sidebar.tsx       ← NUEVO: extraído del AppLayout
│   │   ├── Topbar.tsx        ← NUEVO
│   │   └── SeedModeBanner.tsx ← refactor visual
│   ├── feedback/
│   │   └── ToastHost.tsx     ← refactor visual
│   ├── dashboard/
│   │   └── KpiCard.tsx       ← refactor visual
│   └── (otros componentes específicos: RoomCard, ReservationCard, etc.)
├── pages/                    ← todas las páginas se refactorizan visualmente
└── tailwind.config.js        ← extensión con tokens
```

## 6. Iconografía

`src/components/icons.tsx` exporta un componente por icono. Plantilla:

```tsx
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

export const Dashboard = ({ size = 20, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
       strokeLinejoin="round" {...props}>
    <path d="M3 12L12 4l9 8" />
    <path d="M5 10v10h14V10" />
  </svg>
)
```

Iconos requeridos (cubren todo lo que usa lucide-react hoy):
`Dashboard`, `Bed`, `BedDouble`, `Users`, `User`, `UserCircle`, `Calendar`, `Clock`, `Shield`, `ClipboardList`, `LogOut`, `Search`, `Plus`, `Pencil`, `Trash`, `Check`, `X`, `AlertCircle`, `ArrowRight`, `Eye`, `EyeOff`, `KeyRound`, `Wrench`, `ChevronDown`, `ChevronRight`, `Copy`.

Todos en stroke 1.5px, viewBox 24, `currentColor`, sin `fill`. Color heredado del contenedor.

Tras crear todos los iconos, `npm uninstall lucide-react` y reemplazar todos los imports.

## 7. Componentes UI compartidos

Cada uno tipado, sin estado interno innecesario, props mínimas.

| Componente | Variantes / props clave |
|---|---|
| `Button` | `variant: primary \| secondary \| ghost \| danger`, `size: sm \| md \| lg`, `loading`, `icon` |
| `Card` | `padding: sm \| md \| lg`, `as: 'div' \| 'section'` |
| `Badge` | `tone: neutral \| success \| warning \| danger \| info` |
| `Input` | label, error, hint, leftIcon, rightIcon |
| `Select` | igual que Input + options |
| `Modal` | open, onClose, title, children, footer |
| `Table` | columns config + data, empty slot |
| `Tabs` | items, active, onChange |
| `EmptyState` | icon, title, description, action |
| `Avatar` | initials, size |

## 8. Pantallas (lista exhaustiva)

Cada pantalla mantiene su lógica actual. Solo se reemplaza la capa visual y se reemplazan los imports de `lucide-react` por `@/components/icons`.

| Pantalla | Cambios |
|---|---|
| `/login` | Split 50/50. Izquierda: panel `ink-900` con logo serif "HM" + tagline. Derecha: form blanco sobre `sand-50`, inputs grandes. Sin blobs, sin glassmorphism. |
| `/register` | Misma estética que login (aunque el plan dice "sin link de registro" — la página existe pero no se enlaza). |
| `AppLayout` + `Sidebar` + `Topbar` | Sidebar 256px crema con logo serif, items con icono SVG, item activo con barra `copper-500` izquierda + fondo `sand-100`. Topbar con título de página + chip de usuario (Avatar + nombre + dropdown logout). |
| `/dashboard` | Header con eyebrow + título serif. 4 `KpiCard` (número grande serif Fraunces, label, icono). Card "Reservas de hoy" debajo con tabla o `EmptyState`. |
| `/rooms` | Toolbar con filtros chip (tipo / estado) + botón "Nueva" para SuperAdmin. Grid responsive de `RoomCard` (número grande serif, tipo, precio, `Badge` estado). |
| `/rooms/new`, `/rooms/[id]/edit` | Card centrada con formulario. |
| `/clients` | `ClientSearchInput` arriba (debounce 300ms existente). Tabla con avatar inicial, nombre, email, documento, fecha. (No existe `/clients/[id]` en el codebase actual — solo listado.) |
| `/reservations` | Toolbar con chips de estado. Tabla con Cliente / Habitación / Check-in / Check-out / Estado / Total. |
| `/reservations/new` | Card único largo con secciones (cliente → fechas → habitación) — no wizard de pasos para mantener simple. |
| `/my-reservations` | Cards verticales tipo "tarjeta de viaje" con habitación, fechas, total, Badge estado. Empty state si no hay. |
| `/profile` | Datos del usuario en card. Form de cambio de contraseña debajo. |
| `/admin/users` | Tabla con Badge de rol. Modal de creación que revela password temporal una vez con botón "Copiar". |
| `/admin/audit` | Timeline vertical con icono por tipo + payload colapsable. |
| `/admin/db-setup` | Card de estado con Badges de conexión + botón "Verificar". |
| `/search` | Search input + tabla de resultados unificada. (Usa `ClientSearch` y `OccupancyChart` — ambos componentes se conservan, refactor visual sin tocar lógica.) |
| `/users` | Tabla con badge de rol — misma estética que `/admin/users` pero sin modal de creación. Página no enlazada desde la sidebar; queda como herramienta opcional. |
| `/` (index) | Sin cambios (solo redirige). |

## 9. Estados vacíos y errores

- Todos los listados muestran `EmptyState` cuando no hay datos.
- Errores 401: ya manejados por `lib/api.ts` (redirect a `/login`).
- Errores 403, 409, 500: toast vía `ToastHost` (existente).
- Loading: skeleton suaves con `animate-pulse` Tailwind sobre la forma del componente final (no spinners centrados).

## 10. Dependencias

**Añadir**: ninguna (Tailwind y next/font ya están).

**Quitar**: `lucide-react` (tras migrar todos los iconos).

## 11. Plan de implementación de alto nivel

(Plan detallado vendrá en el documento de `writing-plans`.)

Fases ordenadas, cada una commit-eable independientemente:

1. **Fundamentos**: `tokens.css`, fuentes `next/font`, extensión Tailwind, `globals.css`. Sin tocar UI todavía. Build + dev OK.
2. **Iconos**: `src/components/icons.tsx`. No reemplazar imports aún.
3. **Componentes UI base**: `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Table`, `Tabs`, `EmptyState`, `Avatar`.
4. **Layout**: `AppLayout`, `Sidebar`, `Topbar`, `SeedModeBanner`. Reemplazar imports lucide → icons.
5. **Login + register**: split layout nuevo.
6. **Dashboard + KpiCard**: aplicar nuevo sistema.
7. **Rooms** (list + new + edit + RoomCard).
8. **Clients** (list + detalle si aplica + ClientSearchInput refresh).
9. **Reservations** (list + new + ReservationForm).
10. **My-reservations**.
11. **Profile**.
12. **Admin/Users + Admin/Audit + DB-setup**.
13. **Limpieza**: remover lucide-react del package.json, remover `--hm-*` legacy de globals.css. (Nota: `OccupancyChart.tsx` SÍ se usa — en `/search` — no es zombie.)
14. **QA**: `npm run typecheck`, `npm run lint`, `npm run build`, recorrido manual con tres roles.

## 12. Riesgos

- Tailwind v3 con custom tokens — verificar JIT compila bien.
- Hot reload de Next con cambios masivos — committear por fase para no perder trabajo.
- `users.tsx` (441 líneas) y `ClientSearch.tsx` (621 líneas) son grandes; el refactor visual sin partir la lógica requiere disciplina.
- Eliminar `lucide-react` debe ser **el último paso** después de que todos los imports estén migrados, si no el build se rompe.

## 13. Criterio de aceptación

- `npm run dev` y `npm run build` sin errores ni warnings de TypeScript.
- Sin imports de `lucide-react` en todo `src/`.
- Sin uso de `--hm-*` en CSS (solo los tokens nuevos `--sand`, `--ink`, `--copper`).
- Login / dashboard / sidebar / rooms / clients / reservations / my-reservations / profile / admin/users / admin/audit con el nuevo lenguaje.
- Los tres roles funcionan: SuperAdmin ve todo, Recepcionista no ve admin/*, Cliente solo `/my-reservations` y `/profile`.
- Tipografías cargan con `next/font` (sin FOUT).
- Las credenciales `admin@xavi.com / admin123` siguen funcionando contra Supabase.
