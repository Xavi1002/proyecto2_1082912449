# Resumen Fase 6 — Pulido Final

## URLs

- **URL de producción:** No publicada desde esta sesión
- **URL del repositorio:** https://github.com/Xavi1002/proyecto2_1082912449.git

## Funcionalidades implementadas

- Gestión de usuarios internas con contraseña temporal.
- `mustChangePassword=true` para nuevas cuentas y redirección a `/profile` cuando corresponde.
- Modal de contraseña temporal con botón de copiar.
- Página de administración de usuarios en `/admin/users`.
- Página de auditoría en `/admin/audit` con eventos consultables.
- Empty states consistentes para dashboard, habitaciones, clientes y reservas.
- Manejo global de errores para 401 y 500 desde el cliente.
- Redirección silenciosa del cliente fuera de rutas restringidas.
- Deshabilitación del registro público.
- Verificación de seguridad del portal de cliente a nivel de frontend y backend.

## Stack

- Backend: Express, Sequelize, PostgreSQL, TypeScript.
- Frontend: Next.js Pages Router, React 18, TypeScript, Tailwind CSS, Axios.
- Autenticación: JWT con rol y flag `mustChangePassword`.
- UI: layout por rol, toasts globales, modales y estados vacíos con tono operativo.

## Tablas de Supabase

- `roles`
- `users`
- `rooms`
- `clients`
- `reservations`

## Decisiones técnicas destacadas

- `createReservation` mantiene la secuencia crítica: validar disponibilidad, verificar solapamiento, snapshot de precio, crear reserva, marcar habitación ocupada y auditar.
- El snapshot de precio se conserva en `pricePerNightSnapshot` para preservar el histórico.
- El portal del cliente queda vinculado por `user_id` en `clients`.
- El middleware del frontend restringe silenciosamente al cliente y lo devuelve a `/my-reservations`.
- La auditoría se persiste como log consultable para la vista administrativa.
- El frontend usa toasts globales para sesión expirada y errores internos.

## Estado final

- `npm run lint`: sin warnings ni errores.
- `npm run build` en frontend: exitoso.
- `backend npm run build`: exitoso.
- Proyecto cerrado funcionalmente dentro de esta sesión.