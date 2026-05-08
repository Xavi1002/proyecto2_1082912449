# PROMPTS DE IMPLEMENTACIÓN — HotelManager Pro
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_HOTELMANAGER.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_HOTELMANAGER.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_HOTELMANAGER.md
2. Leer doc/ESTADO_EJECUCION_HOTELMANAGER.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_HOTELMANAGER.md y crear el archivo
doc/ESTADO_EJECUCION_HOTELMANAGER.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
sistemas de gestión con múltiples roles de usuario.

Tu mentalidad: HotelManager Pro reemplaza los cuadernos y hojas de cálculo
de un hotel mediano. El recepcionista lo usa todo el día para crear
reservas y buscar clientes. El SuperAdmin lo usa para configurar el sistema.
El cliente lo consulta para ver si su reserva sigue activa. Los tres tienen
necesidades distintas — el sistema tiene que redirigirlos al lugar correcto
desde el primer segundo del login.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — secciones 7 (stack — HotelManager Pro NO usa
   Resend), 8 (reglas de oro — especialmente reglas 2, 3 y 4 sobre la
   atomicidad de las operaciones de reserva y el snapshot de precio), 9
   (seed.json con SuperAdmin y 4 habitaciones demo), 12 (blobAudit) y 16
   (identidad visual del login — layout dividido, panel azul oscuro)
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— El JWT incluye el role ('superadmin', 'recepcionista', 'cliente'). La
  redirección post-login:
  superadmin y recepcionista → /dashboard
  cliente → /my-reservations
  Esta redirección ocurre en el cliente al recibir la respuesta exitosa,
  usando el role del JWT.

— No hay registro público. El formulario de login no tiene link de
  "Crear cuenta". El SuperAdmin crea todos los usuarios desde el panel.

— El seedReader expone las 4 habitaciones demo para que en modo seed el
  sistema pueda mostrar el inventario de habitaciones antes del bootstrap.

— El token de Blob lazy, get() del SDK de Blob, withFileLock — patrón
  estándar del curso.

— La identidad visual del login: layout dividido, panel izquierdo con
  gradiente from-slate-800 to-blue-800, formulario a la derecha. Sección
  16 del plan.

Al terminar:
- npm run typecheck — cero errores
- Probar: login SuperAdmin del seed → JWT con role='superadmin' → modo seed
- Registra el cierre en ESTADO_EJECUCION_HOTELMANAGER.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. HotelManager Pro tiene tres roles con experiencias
de navegación distintas. El sidebar tiene que ser dinámico y el middleware
tiene que garantizar que el cliente no puede acceder a rutas administrativas.

Tu mentalidad: un recepcionista a las 7am abre HotelManager Pro y necesita
ver en segundos: cuántas habitaciones están disponibles y si hay reservas
que entran hoy. El dashboard tiene que responder esas preguntas sin navegar
a ningún lado.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — paleta de colores (sección 16 — azul como
   primario, los badges de estado con sus hex exactos), los sidebars por
   rol, los componentes KpiCard y RoomsSummary, y la Fase 2 completa
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— Sidebar del SuperAdmin: Dashboard, Habitaciones, Clientes, Reservas,
  Administración (Usuarios + Auditoría), Perfil.
  Sidebar del Recepcionista: Dashboard, Habitaciones (solo vista), Clientes,
  Reservas, Perfil.
  Sidebar del Cliente: Mis Reservas, Perfil. Solo dos ítems.

— El middleware.ts: si el usuario tiene role='cliente', solo puede acceder
  a /my-reservations, /profile y /api/reservations/my. Cualquier otra ruta
  privada → redirect silencioso a /my-reservations sin mostrar un error 403.

— Las 4 KPIs del dashboard: habitaciones disponibles (verde), ocupadas
  (rojo), en mantenimiento (ámbar), reservas activas de hoy (azul). Cada
  KpiCard tiene un ícono Lucide relevante y el número en grande.

— La página /admin/db-setup informa: "Aplicará 4 migrations y cargará:
  1 usuario SuperAdmin y 4 habitaciones demo."

Al terminar:
- Probar los tres roles: SuperAdmin y Recepcionista ven el dashboard;
  cliente ve /my-reservations
- Verificar que el cliente no puede navegar a /rooms (redirect silencioso)
- Bootstrap completo: 4 habitaciones demo en Supabase
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_LAYOUT.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Habitaciones

### Rol: `Ingeniero Fullstack — CRUD de habitaciones con control de acceso`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
inventarios de recursos físicos con estados, validaciones de integridad
referencial y control de acceso diferenciado por rol.

Tu mentalidad: las habitaciones son el inventario del hotel. Su estado tiene
que reflejar la realidad operativa — si la habitación 301 está ocupada, no
puede aparecer como disponible para una nueva reserva. El SuperAdmin define
el catálogo; Recepción solo cambia el estado de forma manual cuando es
necesario (mantenimiento).

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — migration 0002 (rooms con el UNIQUE en
   room_number), reglas RN-03, RN-06 y RN-08, el endpoint /api/rooms/available,
   y la Fase 3 completa
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— room_number tiene UNIQUE en la tabla. Al capturar el error de Postgres
  (código '23505'): retornar 409 con "Ya existe una habitación con el
  número [X]."

— RN-08: al eliminar una habitación, verificar:
  SELECT COUNT(*) FROM reservations WHERE room_id = ? AND status = 'activa'
  Si > 0: retornar 409 con "La habitación tiene [N] reservas activas y no
  puede eliminarse."

— GET /api/rooms/available?checkIn=&checkOut= retorna habitaciones con
  status='disponible' que NO tienen reservas activas solapadas con el rango:
  SELECT * FROM rooms r WHERE r.status = 'disponible'
  AND r.id NOT IN (
    SELECT res.room_id FROM reservations res
    WHERE res.status = 'activa'
    AND res.check_in < $checkOut AND res.check_out > $checkIn
  )
  Este endpoint es el que alimenta el selector de habitaciones en el
  formulario de nueva reserva.

— El Recepcionista puede usar PATCH /api/rooms/[id]/status para cambiar
  a 'mantenimiento' o de vuelta a 'disponible'. NO puede crear ni eliminar
  habitaciones — eso es solo SuperAdmin (RN-03 y RN-06).

Al terminar:
- Las 4 habitaciones demo del bootstrap aparecen en el inventario
- Crear habitación con número duplicado → 409
- Intentar eliminar habitación con reservas activas (insertar una en Supabase
  manualmente) → 409
- Verificar que el Recepcionista no puede hacer POST /api/rooms → 403
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_HABITACIONES.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Gestión de Clientes y Portal del Huésped

### Rol: `Ingeniero Fullstack — Registro de clientes y acceso al portal`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
perfiles de clientes con validaciones de unicidad y flujos de incorporación
con contraseñas temporales para acceso al portal.

Tu mentalidad: el cliente del hotel llega con su documento de identidad.
Recepción registra sus datos y puede opcionalmente darle acceso al portal
digital para que consulte sus reservas desde el celular. La vinculación
entre el registro de cliente y la cuenta de usuario es el mecanismo que
hace posible ese portal.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — migration 0003 (clients con user_id opcional),
   reglas RN-05 y RN-07, la relación users ↔ clients, y la Fase 4 completa
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— La tabla clients tiene user_id UUID nullable que referencia users. Es
  null para clientes sin cuenta digital. Cuando Recepción quiere darle
  acceso al portal al huésped: crea user con role='cliente', hashea la
  contraseña temporal, must_change_password=true, y vincula el user_id
  al registro del cliente. Se puede hacer en el mismo formulario de
  creación del cliente (checkbox "Dar acceso al portal") o desde el perfil.

— RN-05: email y identification_number tienen UNIQUE en la tabla. Los mensajes
  de error son diferentes: "Ya existe un cliente con ese correo" vs "Ya
  existe un cliente con ese número de documento." No mezclar los mensajes.

— ClientSearchInput usa debounce de 300ms → GET /api/clients/search?q=
  que hace ILIKE por nombre O por identification_number. Retorna los
  primeros 8 resultados. El dropdown muestra nombre y documento.

— RN-07: el cliente autenticado que consulta GET /api/clients/[id] recibe
  403 si el id no corresponde a su propio user_id en la tabla clients.
  Verificar: SELECT * FROM clients WHERE id = ? AND user_id = JWT.userId.

Al terminar:
- Crear cliente sin cuenta → aparece en el listado
- Crear cliente con cuenta → contraseña temporal visible una sola vez →
  cliente hace login → redirect a /profile para cambiar → accede a
  /my-reservations
- Email duplicado → 409 con mensaje "Ya existe un cliente con ese correo"
- Documento duplicado → 409 con mensaje diferente
- Probar ClientSearchInput: buscar por nombre parcial y por documento
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_CLIENTES.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Sistema de Reservas

### Rol: `Ingeniero Fullstack Senior — Operación más crítica del sistema`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de reservas de recursos físicos, validaciones de disponibilidad temporal y
operaciones que modifican múltiples entidades de forma atómica.

Tu mentalidad: la reserva es la operación de mayor valor del hotel. Si el
sistema acepta dos reservas solapadas para la misma habitación, el hotel
tiene que manejar un conflicto real con un huésped en recepción. La
validación de solapamiento en el servidor es la garantía central del sistema
y no puede tener ningún bug.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — migration 0004 (reservations con CHECK
   check_out > check_in y el snapshot de precio), la implementación completa
   de createReservation (sección 10.2), reglas RN-02, RN-04 y RN-09, y la
   Fase 5 completa
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— La secuencia de createReservation (sección 10.2) es exacta:
  (1) Verificar habitación existe y status='disponible'.
  (2) Verificar solapamiento con la query del plan.
  (3) Calcular noches y total con snapshot del precio.
  (4) INSERT en reservations con price_per_night_snapshot.
  (5) UPDATE rooms SET status='ocupada'.
  (6) recordAudit.
  Si el paso 5 falla después del paso 4: la reserva existe pero la
  habitación no cambió de estado — inconsistencia. En Supabase, ejecutar
  los dos pasos en secuencia inmediata y documentar este riesgo en el
  RESUMEN de la fase.

— RN-09 — snapshot de precio: price_per_night_snapshot se copia de
  room.price_per_night en el momento de crear la reserva. Si el SuperAdmin
  cambia el precio de la suite de $380.000 a $450.000 mañana, las
  reservas de hoy siguen teniendo $380.000 en price_per_night_snapshot.
  Verificar esto explícitamente en las pruebas.

— cancelReservation: verificar que la reserva está en status='activa'. Si
  no: 409. Al cancelar: UPDATE status='cancelada' + UPDATE rooms
  SET status='disponible'.

— El ReservationForm carga habitaciones disponibles dinámicamente: al
  cambiar check_in o check_out, llama a GET /api/rooms/available con esas
  fechas y actualiza el listado de habitaciones seleccionables.

— El total se calcula en tiempo real: al seleccionar la habitación y tener
  las fechas, mostrar "N noches × $XXX.XXX = $X.XXX.XXX". El cálculo
  definitivo lo hace el servidor — el cliente solo lo muestra como referencia.

Al terminar:
- Flujo completo: seleccionar cliente → fechas → ver habitaciones disponibles
  → elegir habitación → ver total → confirmar → habitación cambia a ocupada
- Probar solapamiento: crear reserva del 10 al 15 → intentar crear otra del
  12 al 17 para la misma habitación → 409 con las fechas del conflicto
- Probar cancelación: cancelar reserva → habitación vuelve a disponible
- Probar RN-09: cambiar precio de habitación → ver que reserva anterior
  tiene el precio original en price_per_night_snapshot
- Probar portal cliente: login como cliente → ver solo sus reservas en
  /my-reservations → intentar ir a /rooms → redirect silencioso
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_RESERVAS.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Administración y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de HotelManager Pro.

Tu mentalidad: HotelManager Pro lo usan personas en un entorno de trabajo
real — una recepcionista atendiendo a varios clientes a la vez, un gerente
revisando el estado del hotel desde su tablet. El sistema tiene que ser
confiable, rápido y sin errores confusos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELMANAGER.md — Fase 6 completa, los requerimientos no
   funcionales (RNF-01 al RNF-07) y las restricciones (sección 18)
2. doc/ESTADO_EJECUCION_HOTELMANAGER.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Lo que debes completar en esta fase:

Administración de usuarios:
POST genera contraseña temporal, must_change_password=true, retorna en claro
una sola vez con modal y botón "Copiar". Login → /profile si
must_change_password.
Crear app/admin/users/page.tsx y app/admin/audit/page.tsx.

Empty states con el tono de un sistema de gestión hotelero:
- Dashboard sin reservas hoy: "No hay reservas activas para hoy."
- Listado de habitaciones vacío: "No hay habitaciones registradas." (admin
  ve el botón "Nueva habitación")
- Listado de clientes vacío: "No hay clientes registrados."
- Sin reservas para los filtros: "No hay reservas con los filtros aplicados."
- Portal del cliente sin reservas: "Aún no tienes reservas. Contacta
  con recepción para hacer tu reserva."

Manejo de errores global:
- 401: sesión expirada → toast + redirect a /login.
- 403 (cliente en ruta restringida): redirect silencioso a /my-reservations.
- 409 solapamiento: mensaje con las fechas: "La habitación [Nro] ya tiene
  una reserva del [fecha] al [fecha]."
- 409 habitación con reservas al eliminar: "Hay [N] reserva(s) activa(s)
  para esta habitación."
- 409 email duplicado: mensaje específico.
- 409 documento duplicado: mensaje específico diferente.
- 500: toast genérico.

Verificación de seguridad del portal del cliente en producción:
(1) Login como cliente → redirigido a /my-reservations.
(2) Navegar a /rooms → redirect silencioso.
(3) GET /api/rooms directamente → 403.
(4) GET /api/reservations directamente → 403.
(5) GET /api/clients/[id_de_otro_cliente] → 403.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo:
SuperAdmin: bootstrap → crea habitaciones → crea cliente con cuenta digital.
Recepcionista: login → crear reserva → habitación cambia a ocupada.
Cliente: login → ver sus reservas → intentar ir a /rooms → redirect.
SuperAdmin: ver dashboard con KPIs reales → auditoría con los eventos.

Al cerrar el proyecto:
- Registra la Fase 6 como Completada en ESTADO_EJECUCION_HOTELMANAGER.md
  con la URL de producción
- Crea doc/RESUMEN_FASE_6_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase,
  decisiones técnicas destacadas (atomicidad de createReservation, snapshot
  de precio, portal del cliente vinculado por user_id, restricción del
  cliente en middleware) y estado final del proyecto

El proyecto HotelManager Pro está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Xavi Jiménez — Doc: 1082912449
> Curso: Lógica y Programación — SIST0200
