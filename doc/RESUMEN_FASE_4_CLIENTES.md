# RESUMEN FASE 4 - GESTION DE CLIENTES

Fecha: 2026-05-15
Estado: COMPLETADA

## Alcance implementado

1. Modelo de clientes con vinculo opcional a usuario
- Archivo: backend/src/models/Client.ts
- Campos: name, email (UNIQUE), phone, identificationNumber (UNIQUE), userId nullable.
- Relacion: clients.userId -> users.id (opcional).

2. API de clientes
- Archivo: backend/src/controllers/clientController.ts
- Archivo: backend/src/routes/clients.ts
- Endpoints:
  - GET /api/clients
  - POST /api/clients
  - GET /api/clients/search?q=
  - GET /api/clients/:id
  - PUT /api/clients/:id
  - DELETE /api/clients/:id

3. RN-05 (unicidad con mensajes diferenciados)
- Email duplicado -> 409 "Ya existe un cliente con ese correo"
- Documento duplicado -> 409 "Ya existe un cliente con ese número de documento."

4. Flujo de cuenta portal opcional
- En POST/PUT de cliente, si givePortalAccess=true:
  - Crea user con role=Cliente
  - Hashea contraseña temporal
  - mustChangePassword=true
  - Vincula userId en client
  - Devuelve temporaryPassword una sola vez en la respuesta

5. RN-07 (aislamiento de perfil cliente)
- GET /api/clients/:id valida:
  - Si role=Cliente, solo puede ver su propio client vinculado por userId.
  - Si no coincide, retorna 403.

6. Búsqueda debounce 300ms
- Componente nuevo: frontend/src/components/ClientSearchInput.tsx
- Consulta: GET /api/clients/search?q=
- Búsqueda por nombre parcial o documento parcial (ILIKE)
- Límite: 8 resultados
- Dropdown: nombre + documento

7. UI de gestión de clientes
- Página nueva: frontend/src/pages/clients.tsx
- Incluye:
  - Buscador ClientSearchInput
  - Formulario crear cliente con checkbox "Dar acceso al portal"
  - Mensaje de contraseña temporal visible una sola vez
  - Listado de clientes con estado de acceso portal

8. Flujo de contraseña temporal y primer ingreso
- Backend:
  - Campo mustChangePassword agregado a User
  - Endpoint: POST /api/auth/change-password
- Frontend:
  - login redirige a /profile cuando mustChangePassword=true
  - profile permite cambiar contraseña actual/nueva
  - tras cambio, mustChangePassword pasa a false

9. Compatibilidad middleware/rutas cliente
- Alias agregado: GET /api/reservations/my (además de /my-reservations)
- Alineado con restricción de rutas privadas del cliente.

## Archivos creados/modificados principales

Backend:
- backend/src/models/Client.ts
- backend/src/controllers/clientController.ts
- backend/src/routes/clients.ts
- backend/src/controllers/authController.ts
- backend/src/models/User.ts
- backend/src/routes/auth.ts
- backend/src/routes/reservations.ts
- backend/src/index.ts

Frontend:
- frontend/src/components/ClientSearchInput.tsx
- frontend/src/pages/clients.tsx
- frontend/src/pages/login.tsx
- frontend/src/pages/profile.tsx
- frontend/src/lib/useAuth.ts

Documentación:
- doc/ESTADO_EJECUCION_HOTELMANAGER.md
- doc/RESUMEN_FASE_4_CLIENTES.md

## Validación técnica ejecutada

- backend: npm run build -> OK
- frontend: npm run typecheck -> OK

## Checklist solicitado

- Crear cliente sin cuenta -> implementado en formulario y endpoint.
- Crear cliente con cuenta + contraseña temporal una sola vez -> implementado.
- Email duplicado 409 con mensaje exacto -> implementado.
- Documento duplicado 409 con mensaje diferenciado -> implementado.
- ClientSearchInput con debounce 300ms por nombre/documento -> implementado.
- npm run typecheck -> ejecutado (frontend) y sin errores.

## Nota operativa

La verificación end-to-end completa (login real del cliente recién creado y navegación en runtime con backend levantado y BD con datos) queda lista para ejecutarse en entorno local con servidor activo.
