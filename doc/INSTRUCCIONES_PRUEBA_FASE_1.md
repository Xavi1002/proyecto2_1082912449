# 🚀 Instrucciones de Prueba — Fase 1 HotelManager Pro

## Requisitos Previos

- Node.js 18+ instalado
- npm 9+ instalado
- Git configurado
- Editor de código (VS Code recomendado)

---

## 1️⃣ Instalación Inicial

```bash
cd frontend
npm install
```

Verifica que todas las dependencias se instalen correctamente.

---

## 2️⃣ Configuración de Entorno

### Modo Seed (Default — Sin Supabase)

El proyecto funciona **out-of-the-box en modo seed**. No requiere Supabase configurado.

**No es necesario crear un archivo `.env.local`** — el sistema usa valores por defecto:
```javascript
// Valores por defecto (lib/auth.ts)
JWT_SECRET = 'dev-secret-do-not-use-in-production'
ADMIN_BOOTSTRAP_SECRET = 'dev-bootstrap-secret'
BLOB_READ_WRITE_TOKEN = undefined (auditoría se registra en logs)
```

### Modo Live (Opcional — Con Supabase)

Si tienes Supabase configurado, crea `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_BOOTSTRAP_SECRET=your-bootstrap-secret
```

---

## 3️⃣ Validación de Tipos

Ejecuta type checking:

```bash
npm run typecheck
```

**Resultado esperado**: ✅ Sin errores de TypeScript

---

## 4️⃣ Ejecutar en Desarrollo

```bash
npm run dev
```

**Salida esperada**:
```
> next dev
- Local:        http://localhost:3000
```

Abre http://localhost:3000 en el navegador.

---

## 5️⃣ Prueba de Flujo Completo (Modo Seed)

### 5.1 Redirección desde Home
1. Accede a http://localhost:3000
2. **Resultado esperado**: Redirecciona a `/login` (no autenticado)

### 5.2 Obtener Modo del Sistema
```bash
curl http://localhost:3000/api/system/mode
```

**Respuesta esperada (seed)**:
```json
{
  "mode": "seed",
  "message": "Sistema en modo SEED (sin Supabase configurado)"
}
```

### 5.3 Diagnóstico del Sistema
```bash
curl http://localhost:3000/api/system/diagnose
```

**Respuesta esperada (seed)**:
```json
{
  "mode": "seed",
  "status": {
    "supabase_configured": false,
    "supabase_admin_configured": false,
    "blob_token_configured": false,
    "jwt_secret_configured": true,
    "database_configured": false
  },
  "environment": {
    "node_env": "development",
    "app_mode": "BOOTSTRAP"
  },
  "requirements_met": {
    "can_login": true,
    "can_create_audit": false,
    "can_migrate_db": false
  }
}
```

### 5.4 Login SuperAdmin del Seed

**En el navegador:**
1. Accede a http://localhost:3000/login
2. Email: `admin@hotelmanager.com`
3. Contraseña: `admin123`
4. Click "Iniciar Sesión"

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Cookie `hotelmanager_auth` se crea (HttpOnly)
- ✅ Redirecciona a `/dashboard` (role='superadmin')

### 5.5 Obtener Usuario Autenticado
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: hotelmanager_auth=<token>"
```

**Respuesta esperada**:
```json
{
  "user": {
    "id": "seed-user-001",
    "email": "admin@hotelmanager.com",
    "name": "Super Administrador",
    "role": "superadmin",
    "is_active": true,
    "must_change_password": false
  }
}
```

### 5.6 Cambiar Contraseña (Opcional)
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Cookie: hotelmanager_auth=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "admin123",
    "new_password": "newpassword123",
    "confirm_password": "newpassword123"
  }'
```

### 5.7 Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Resultado esperado:**
- ✅ Cookie se elimina
- ✅ Respuesta: `{ "success": true, "message": "Sesión cerrada" }`

---

## 6️⃣ Prueba Modo Live (Con Supabase)

### 6.1 Verificar Diagnóstico
```bash
curl http://localhost:3000/api/system/diagnose
```

**Resultado esperado con Supabase:**
```json
{
  "mode": "live",
  "status": {
    "supabase_configured": true,
    "supabase_admin_configured": true,
    "database_configured": true
  }
}
```

### 6.2 Ejecutar Bootstrap
```bash
curl -X POST http://localhost:3000/api/system/bootstrap \
  -H "Content-Type: application/json" \
  -d '{ "secret": "dev-bootstrap-secret" }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "migrations": {
    "success": true,
    "appliedCount": 1,
    "errors": []
  },
  "seed": {
    "admin_created": true,
    "admin_email": "admin@hotelmanager.com",
    "rooms_created": true,
    "rooms_count": 4
  }
}
```

### 6.3 Verificar Base de Datos
- Tabla `users` creada con SuperAdmin
- Tabla `rooms` creada con 4 habitaciones demo
- Tabla `_migrations` con entrada 0001_init_users

---

## 7️⃣ Pruebas de Validación

### Validación de Email
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "invalid-email", "password": "test" }'
```

**Resultado esperado**: 400 Bad Request con error de validación Zod

### Validación de Contraseña Incorrecta
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@hotelmanager.com", "password": "wrongpassword" }'
```

**Resultado esperado**: 401 Unauthorized

### Acceso sin Autenticación
```bash
curl http://localhost:3000/api/auth/me
```

**Resultado esperado**: 401 Unauthorized

---

## 8️⃣ Verificaciones de Diseño

### 8.1 Página de Login
- [ ] Panel izquierdo: Gradiente `from-slate-800 to-blue-800` ✅
- [ ] Logo: SVG de hotel en azul primario (#1D4ED8) ✅
- [ ] Título: "HotelManager Pro" en Inter Bold 26px ✅
- [ ] Formulario: Tarjeta blanca con borde azul arriba ✅
- [ ] Email input: Placeholder "tu@email.com" ✅
- [ ] Password input: Placeholder "••••••••" ✅
- [ ] Botón: Azul con hover más oscuro ✅
- [ ] Error message: Animación Framer Motion ✅
- [ ] Sin link de registro: Nota "Contacta al administrador" ✅
- [ ] Responsive: Panel izquierdo oculto en móviles ✅

### 8.2 Estilos Globales
- [ ] Paleta de colores CSS variables ✅
- [ ] Badges (available, occupied, maintenance) ✅
- [ ] Font: Inter de next/font/google ✅

---

## 9️⃣ Solución de Problemas

### Error: "ENOENT: no such file or directory, open '...seed.json'"
**Solución**: Verifica que `data/seed.json` existe en la raíz del proyecto frontend.

### Error: "npm not found"
**Solución**: Instala Node.js desde https://nodejs.org/

### Error: "Supabase no configurado, pero MODE es 'live'"
**Solución**: El sistema detecta NEXT_PUBLIC_SUPABASE_URL. Verifica `.env.local`.

### Error: "Token inválido o expirado"
**Solución**: El JWT expira en 7 días. Login nuevamente.

### Error: "BLOB_READ_WRITE_TOKEN no configurado"
**Solución**: Normal en modo seed. La auditoría se registra en logs. Para producción, configura Vercel Blob.

---

## 🔟 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Validar tipos
npm run typecheck

# Linter
npm run lint

# Build para producción
npm run build

# Iniciar producción
npm start

# Limpiar node_modules
rm -rf node_modules
npm install
```

---

## 📊 Estructura de Respuestas

### Login Exitoso
```javascript
POST /api/auth/login
{
  success: true,
  user: {
    id: "...",
    email: "admin@hotelmanager.com",
    name: "Super Administrador",
    role: "superadmin",
    must_change_password: false
  }
}
// Set-Cookie: hotelmanager_auth=<jwt>; HttpOnly; SameSite=Lax; Path=/
```

### Error de Validación (400)
```javascript
{
  error: "Datos inválidos",
  details: [ /* ZodError[] */ ]
}
```

### Error de Autenticación (401)
```javascript
{
  error: "No autorizado" | "Token inválido" | "Email o contraseña incorrectos"
}
```

### Error de Acceso (403)
```javascript
{
  error: "Acceso denegado: rol no permitido"
}
```

---

## ✅ Checklist de Validación Final

- [ ] `npm install` completa sin errores
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run dev` inicia servidor en localhost:3000
- [ ] `/api/system/mode` retorna `mode: "seed"`
- [ ] `/api/system/diagnose` muestra estado del sistema
- [ ] Login funciona con admin@hotelmanager.com / admin123
- [ ] Post-login redirecciona a /dashboard
- [ ] `/api/auth/me` retorna usuario autenticado
- [ ] Logout limpia cookie y sesión
- [ ] Página de login tiene diseño visual correcto
- [ ] Formulario de login valida email y contraseña
- [ ] Error messages se muestran con animación
- [ ] Sistema es responsive en móvil/tablet/desktop

---

## 📚 Documentación Relacionada

- [PLAN_HOTELMANAGER.md](PLAN_HOTELMANAGER%20(1).md) — Plan completo del proyecto
- [RESUMEN_FASE_1_BOOTSTRAP.md](RESUMEN_FASE_1_BOOTSTRAP.md) — Resumen de implementación
- [VALIDACION_FASE_1.md](VALIDACION_FASE_1.md) — Validación exhaustiva
- [.env.example](../frontend/.env.example) — Variables de entorno

---

**Generado**: Mayo 14, 2026  
**Para**: Fase 1 — Bootstrap, Login y dataService Base  
**Estado**: ✅ Listo para pruebas
