# Frontend - Next.js

Frontend del proyecto fullstack con Next.js, React y TypeScript.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
# o
yarn install
```

## Desarrollo

```bash
npm run dev
# o
yarn dev
```

El servidor estará disponible en `http://localhost:3000`

## Build

```bash
npm run build
npm run start
```

## Variables de Entorno

Crear archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Estructura

- `src/pages` - Páginas y rutas
- `src/components` - Componentes reutilizables
- `src/lib` - Utilidades y hooks
- `public` - Archivos estáticos

## Sistema de Autenticación

### Páginas de Autenticación

- **`/login`** - Iniciar sesión
- **`/register`** - Crear nueva cuenta
- **`/profile`** - Perfil del usuario (protegido)

### Hook `useAuth`

Hook personalizado para manejar la autenticación en la aplicación:

```typescript
const { user, token, isAuthenticated, register, login, logout } = useAuth()
```

Métodos disponibles:
- `register(name, email, password, role)` - Registrar nuevo usuario
- `login(email, password)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `getCurrentUser()` - Obtener datos del usuario actual

### Componente `ProtectedRoute`

Protege rutas que requieren autenticación:

```typescript
<ProtectedRoute>
  <MiComponente />
</ProtectedRoute>
```

Con validación de roles:

```typescript
<ProtectedRoute requiredRole="SuperAdmin">
  <ComponenteAdmin />
</ProtectedRoute>
```

### Componente `NavBar`

Barra de navegación que muestra:
- Usuario autenticado con su rol
- Botón de cerrar sesión
- Enlaces para login y registro si no está autenticado

### Flujo de Autenticación

1. Usuario se registra en `/register`
2. Sistema crea cuenta y genera JWT
3. Token se guarda en localStorage
4. Usuario puede acceder a rutas protegidas
5. Al cerrar sesión, token se elimina

## Seguridad

- Token almacenado en localStorage
- Header `Authorization: Bearer <token>` en todas las peticiones autenticadas
- Token se valida en el servidor con JWT
- Las contraseñas se hashean con bcrypt en el backend

## Roles Disponibles

- **SuperAdmin**: Acceso total
- **Recepción**: Acceso limitado
- **Cliente**: Acceso estándar
