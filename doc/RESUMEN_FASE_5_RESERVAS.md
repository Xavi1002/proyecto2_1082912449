# RESUMEN FASE 5 - SISTEMA DE RESERVAS

Fecha de ajuste: 2026-05-22
Estado: COMPLETADA
Rol: Ingeniero Fullstack Senior

## Objetivo

Asegurar la operación crítica de reservas sin solapamiento temporal, con snapshot de precio, actualización inmediata del estado de habitación, cancelación consistente y aislamiento del portal de cliente.

## Secuencia crítica validada de createReservation

1. Verificar habitación existente y en estado disponible.
2. Verificar solapamiento en servidor para reservas activas.
3. Calcular noches y total usando snapshot del precio actual.
4. Insertar reserva con `pricePerNightSnapshot`.
5. Actualizar habitación a ocupada.
6. Registrar auditoría.

## Riesgo operativo documentado

La inserción de reserva y el cambio de estado de habitación se ejecutan en secuencia inmediata. Si el paso 5 falla después del paso 4, puede existir la reserva sin que la habitación quede marcada como ocupada. Este riesgo queda explícitamente documentado en código y en este resumen.

## Reglas de negocio cubiertas

1. RN-02 Solapamiento
- Se rechaza creación cuando existe cruce de fechas para la misma habitación activa.
- La respuesta de conflicto incluye fechas de la reserva conflictiva.

2. RN-04 Estado de habitación
- Al crear reserva confirmada: habitación pasa a ocupada.
- Al cancelar reserva activa: habitación vuelve a disponible.

3. RN-09 Snapshot de precio
- `pricePerNightSnapshot` se toma desde el precio vigente de la habitación al momento de crear.
- Cambios posteriores de tarifa no alteran reservas previas.

## UX y frontend de reservas

1. ReservationForm
- Carga dinámica de habitaciones disponibles cuando cambian `checkInDate` y `checkOutDate`.
- Consulta `GET /api/rooms/available` con fechas del formulario.
- Muestra total de referencia en tiempo real:
  - `N noches × $XXX.XXX = $X.XXX.XXX`

2. Portal del cliente
- `/my-reservations` muestra únicamente reservas del usuario autenticado.
- El cliente es redirigido silenciosamente a `/my-reservations` si intenta entrar a `/rooms`.

## Validación técnica ejecutada

- `backend npm run build` -> OK
- `frontend npm run typecheck` -> OK

## Checklist solicitado

- Flujo completo de formulario y confirmación: implementado en backend y frontend.
- Solapamiento 10-15 vs 12-17 misma habitación: respuesta 409 con fechas del conflicto implementada.
- Cancelación y regreso a disponible: implementado.
- RN-09 snapshot frente a cambio de precio posterior: implementado por campo `pricePerNightSnapshot`.
- Portal cliente con aislamiento y redirect silencioso: implementado.
- `npm run typecheck`: ejecutado OK.

## Limitación de esta sesión

No se ejecutaron pruebas end-to-end con datos reales porque el entorno de esta sesión no cuenta con `DATABASE_URL` activa. El código quedó listo para validación inmediata al levantar backend con base conectada.

## Archivos principales

Backend:
- `backend/src/controllers/reservationController.ts`
- `backend/src/models/Reservation.ts`
- `backend/src/routes/reservations.ts`

Frontend:
- `frontend/src/components/ReservationForm.tsx`
- `frontend/src/components/ReservationList.tsx`
- `frontend/src/pages/my-reservations.tsx`
- `frontend/middleware.ts`

## Resultado

Fase 5 cerrada en esta ejecución, con foco en consistencia operativa de reservas y sin avanzar a Fase 6.
