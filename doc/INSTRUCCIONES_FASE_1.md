# Instrucciones para Verificar Fase 1 — Bootstrap

## Requisitos Previos

1. **Node.js 18+** instalado
2. Estar en el directorio `frontend/`

## Paso 1: Instalar Dependencias

```bash
cd frontend
npm install
```

Esto instalará todas las dependencias especificadas en `package.json`.

## Paso 2: Verificar TypeScript

```bash
npm run typecheck
```

**Resultado esperado**: Cero errores.

Si hay errores, revisar:
- Importaciones de rutas (`@/lib/...`)
- Tipos exportados
- Compatibilidad de versiones

## Paso 3: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**Resultado esperado**:
```
> Local:        http://localhost:3000
```

## Paso 4: Probar el Sistema en Modo Seed

### 4.1 Verificar Modo de Operación
Acceder a: http://localhost:3000/api/system/mode

**Respuesta esperada**:
```json
{
  "mode": "seed",
  "message": "Sistema en modo SEED (sin Supabase configurado)"
}
```

### 4.2 Verificar Diagnóstico
Acceder a: http://localhost:3000/api/system/diagnose

**Respuesta esperada**:
```json
{
  "mode": "seed",
  "status": {
    "supabase_configured": false,
    "blob_token_configured": false,
    "database_configured": false,
    "jwt_secret_configured": true
  },
  "requirements_met": {
    "can_login": true,
    "can_create_audit": false,
    "can_migrate_db": false
  }
}
```

### 4.3 Probar Login con SuperAdmin del Seed

**URL**: http://localhost:3000/login

**Credenciales**:
- Email: `admin@hotelmanager.com`
- Contraseña: `admin123`

**Resultado esperado**:
1. Formulario se completa
2. Botón "Iniciar Sesión" se presiona
3. Cookie `hotelmanager_auth` se crea (ver DevTools → Application → Cookies)
4. Redirección a http://localhost:3000/dashboard
5. Dashboard muestra nombre del usuario: "Super Administrador"

### 4.4 Verificar Cookie de Sesión

En DevTools → Application → Cookies:
- **Nombre**: `hotelmanager_auth`
- **Valor**: JWT (starts with `eyJ...`)
- **HttpOnly**: ✓
- **Secure**: ✗ (en desarrollo)
- **SameSite**: Lax

### 4.5 Probar /api/auth/me

Con la sesión activa (en cualquier página después del login):
Acceder a: http://localhost:3000/api/auth/me

**Respuesta esperada**:
```json
{
  "user": {
    "id": "seed-admin-001",
    "email": "admin@hotelmanager.com",
    "name": "Super Administrador",
    "role": "superadmin",
    "must_change_password": false
  }
}
```

### 4.6 Verificar Auditoría

POST a http://localhost:3000/api/auth/login con las credenciales:

En `blob/audit/YYYYMM.json` del Vercel Blob (si está configurado):
```json
[
  {
    "timestamp": "2026-05-11T...",
    "user_email": "admin@hotelmanager.com",
    "action": "login",
    "entity": "user",
    "summary": "Login exitoso"
  }
]
```

**Nota**: En modo seed sin BLOB_READ_WRITE_TOKEN, la auditoría se registra en logs pero no se persiste.

## Paso 5: Probar Redirección por Rol

En modo seed, solo está disponible el SuperAdmin. Después:

1. **Si login es superadmin** → Redirecciona a `/dashboard`
2. **Si login es recepcionista** (Fase 2+) → Redirecciona a `/dashboard`
3. **Si login es cliente** (Fase 4+) → Redirecciona a `/my-reservations`

## Paso 6: Configurar Supabase (Opcional - para Modo Live)

Si deseas probar con Supabase:

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` a `.env.local`
3. Copiar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` a `.env.local`
4. Recargar servidor: `npm run dev`
5. Verificar: http://localhost:3000/api/system/mode → `mode: "live"`
6. Acceder a: http://localhost:3000/admin/db-setup
7. Ingresar secret de bootstrap: Usa valor de `ADMIN_BOOTSTRAP_SECRET` en `.env.local`
8. Click "Ejecutar Bootstrap"

## Troubleshooting

### Error: "No autorizado" al acceder a /dashboard sin login
✓ Comportamiento correcto. Sistema redirige a /login.

### Error: "Email o contraseña incorrectos"
- Verificar: email exacto `admin@hotelmanager.com` (minúsculas)
- Verificar: contraseña `admin123` (sin espacios)
- El hash en `data/seed.json` debe ser válido

### Error: "JWT_SECRET no configurado"
- Verificar `.env.local` tiene `JWT_SECRET`
- Si falta, agregar: `JWT_SECRET=dev-secret-long-enough`

### Error: "seedReader error"
- Verificar que `data/seed.json` existe y es válido JSON
- Ejecutar: `cat frontend/data/seed.json` para validar

### Error: "Cannot find module '@/lib/types'"
- Verificar tsconfig.json tiene: `"paths": { "@/*": ["./src/*"] }`
- Verificar que los archivos están en `src/`

## Siguientes Pasos

Fase 1 está completa. No avances a Fase 2 aún.

Para integración con Supabase:
1. Crear proyecto en supabase.com
2. Configurar `.env.local` con credenciales
3. Ejecutar bootstrap desde `/admin/db-setup`
4. Sistema cambiará a modo live

---

Fecha: Mayo 11, 2026
Curso: Lógica y Programación — SIST0200
