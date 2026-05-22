# RESUMEN FASE 4 - GESTION DE CLIENTES

Fecha de ajuste: 2026-05-22
Estado: COMPLETADA

## Alcance de esta ejecución

Se aplicaron ajustes puntuales de Fase 4 para cumplir exactamente RN-05 y validar RN-07 y flujo de incorporación al portal, sin avanzar a Fase 5.

## Implementación validada

1. Modelo de clientes con vínculo opcional a usuario
- Archivo: backend/src/models/Client.ts
- `userId` es nullable y referencia a `users.id`.
- Permite clientes sin cuenta digital y clientes con portal.

2. RN-05 con mensajes exactos diferenciados
- Archivo: backend/src/controllers/clientController.ts
- Email duplicado: `Ya existe un cliente con ese correo`
- Documento duplicado: `Ya existe un cliente con ese número de documento.`

3. Flujo de alta con acceso al portal
- En `POST/PUT /api/clients`, con `givePortalAccess=true`:
  - crea user con rol cliente,
  - hashea contraseña temporal,
  - marca `mustChangePassword=true`,
  - vincula `client.userId`.
- La contraseña temporal se devuelve una sola vez en la respuesta y en UI se puede cerrar manualmente.

4. RN-07 aislamiento por usuario
- Archivo: backend/src/controllers/clientController.ts
- En `GET /api/clients/:id`, si el rol autenticado es Cliente, se exige coincidencia por `id` y `userId`.
- Si no coincide, responde 403.

5. Búsqueda de clientes con debounce
- Archivo: frontend/src/components/ClientSearchInput.tsx
- Debounce de 300ms.
- Consulta `GET /api/clients/search?q=` con `ILIKE` por nombre o documento.
- Límite de 8 resultados y dropdown con nombre + documento.

6. Flujo de primer login cliente
- Login con `mustChangePassword=true` redirige a `/profile`.
- Cambio de contraseña exitoso redirige a `/my-reservations` para rol Cliente.

## Archivos modificados en este ajuste

- backend/src/controllers/clientController.ts
- frontend/src/pages/clients.tsx
- doc/ESTADO_EJECUCION_HOTELMANAGER.md
- doc/RESUMEN_FASE_4_CLIENTES.md

## Validación técnica ejecutada

- backend: `npm run build` OK
- frontend: `npm run typecheck` OK

## Checklist solicitado

- Crear cliente sin cuenta: implementado en endpoint y listado.
- Crear cliente con cuenta: contraseña temporal visible una sola vez y cierre manual en UI.
- Email duplicado: 409 con mensaje exacto.
- Documento duplicado: 409 con mensaje diferente exacto.
- ClientSearchInput: búsqueda por nombre/documento con debounce 300ms.
- `npm run typecheck`: ejecutado sin errores.

## Nota operativa

En esta sesión no fue posible ejecutar pruebas end-to-end de API porque el entorno no tiene `DATABASE_URL` configurada. La implementación quedó lista para validación inmediata al levantar backend con base activa.
