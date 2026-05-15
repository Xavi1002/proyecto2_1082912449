# RESUMEN FASE 5 - SISTEMA DE RESERVAS

Fecha: 2026-05-15
Estado: COMPLETADA
Rol: Ingeniero Fullstack Senior

## Objetivo
Cerrar la operación más crítica del hotel: crear reservas sin solapamientos, capturar snapshot de precio, cambiar el estado de la habitación y permitir cancelación con liberación de la unidad.

## Implementación realizada

1. Secuencia crítica de `createReservation`
- Verifica que la habitación exista y esté en estado disponible.
- Verifica solapamiento con la query del plan:
  - `checkIn < existing.checkOut`
  - `checkOut > existing.checkIn`
- Calcula noches y total usando snapshot del precio vigente.
- Inserta la reserva con `pricePerNightSnapshot`.
- Cambia la habitación a `ocupada`.
- Registra auditoría con `recordAudit`.

2. Snapshot de precio RN-09
- `pricePerNightSnapshot` se copia desde `room.pricePerNight` al momento de crear la reserva.
- El total se calcula con ese valor congelado.
- El historial de reservas conserva el precio original aunque el SuperAdmin cambie la tarifa después.

3. Cancelación
- `cancelReservation` valida que la reserva esté activa.
- Si no está activa, responde `409`.
- Al cancelar:
  - `reservation.status = 'Cancelada'`
  - `rooms.status = 'Disponible'`

4. Portal del cliente
- `/my-reservations` ahora muestra reservas reales del usuario autenticado.
- El cliente no puede cancelar desde su portal.
- El middleware sigue aplicando redirect silencioso si intenta navegar fuera de sus rutas permitidas.

5. UI de creación
- Página nueva: `/reservations/new`
- Formulario con:
  - búsqueda de cliente
  - carga dinámica de habitaciones disponibles desde `/api/rooms/available?checkIn=&checkOut=`
  - cálculo en tiempo real del total como referencia visual

6. Listado operacional
- `/reservations` quedó como vista operativa para Recepción y SuperAdmin.
- Incluye KPIs simples y enlace directo al alta de reservas.

## Riesgo operativo documentado

La arquitectura actual ejecuta la inserción de la reserva y el cambio de estado de la habitación como dos pasos secuenciales. Si el paso 5 falla después del paso 4, la reserva existe pero la habitación puede quedar sin marcar como ocupada. Ese riesgo fue documentado por instrucción del plan maestro.

## Validaciones ejecutadas

- `backend npm run build` -> OK
- `frontend npm run typecheck` -> OK

## Pendiente fuera del alcance de esta sesión

No se ejecutó una prueba E2E real con base de datos viva y navegador interactivo dentro de esta sesión. El flujo quedó implementado y compilando, pero la verificación manual completa queda lista para correrse en entorno local con el servidor levantado.

## Archivos principales

Backend:
- `backend/src/controllers/reservationController.ts`
- `backend/src/models/Reservation.ts`
- `backend/src/utils/audit.ts`
- `backend/src/routes/reservations.ts`
- `backend/src/controllers/roomController.ts`

Frontend:
- `frontend/src/components/ReservationForm.tsx`
- `frontend/src/components/ReservationList.tsx`
- `frontend/src/pages/reservations.tsx`
- `frontend/src/pages/reservations/new.tsx`
- `frontend/src/pages/my-reservations.tsx`

## Resultado

La Fase 5 queda cerrada con el flujo de reservas crítico implementado, validado por compilación y documentado con el riesgo de inconsistencia secuencial exigido por el plan.
