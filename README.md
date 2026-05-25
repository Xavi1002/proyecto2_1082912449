# Proyecto 2 — Fullstack (Next.js + Express + Sequelize) en Vercel

Aplicación fullstack en un solo proyecto Next.js. El backend Express vive bajo una API catch-all (`src/pages/api/[...slug].ts`) y se ejecuta como Vercel Function. El frontend (Pages Router) llama a `/api/*` con rutas relativas.

## Estructura

```
.
├── src/
│   ├── pages/              # Next.js (Pages Router) — UI
│   │   └── api/
│   │       ├── [...slug].ts   # Catch-all que delega a Express
│   │       └── dashboard.ts   # API route nativa de Next
│   ├── components/         # Componentes React
│   ├── lib/                # Cliente axios + helpers
│   ├── styles/             # Tailwind
│   └── server/             # Backend (Express + Sequelize)
│       ├── app.ts
│       ├── config/database.ts
│       ├── models/ controllers/ routes/ middleware/ utils/
├── middleware.ts           # Middleware de Next (auth por cookie)
├── next.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

## Arranque local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Sin variables de entorno, la app cae automáticamente a una base **SQLite** en `./data/dev.sqlite` (no requiere Docker ni Postgres).

### Variables de entorno (opcionales en local)

Copia `.env.example` a `.env.local` si necesitas personalizar:

```env
JWT_SECRET=cambia-este-secreto-en-produccion
JWT_EXPIRES_IN=7d

# Para usar Postgres en lugar de SQLite:
# DATABASE_URL=postgres://user:password@host:5432/db
```

## Despliegue en Vercel

1. Sube este repo a GitHub.
2. En Vercel: **Add New → Project → Import** el repo. El framework se detecta como Next.js.
3. Provee una base de datos (Marketplace → Neon Postgres, o usa Supabase). Copia el `DATABASE_URL`.
4. Configura las variables en **Project → Settings → Environment Variables**:
   - `DATABASE_URL` (Postgres)
   - `JWT_SECRET` (cadena aleatoria)
5. Deploy. La primera petición creará las tablas (`sequelize.sync({ alter: true })`) y sembrará los roles base.

## Endpoints principales

- `GET  /api/health`
- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/users`
- `GET/POST/PUT/DELETE /api/rooms` · `GET /api/rooms/statistics`
- `GET/POST/PUT/DELETE /api/reservations`
- `GET/POST/PUT/DELETE /api/clients`
- `GET /api/audit`
- `GET /api/dashboard` (agregado por Next, mezcla rooms+reservations)

## Notas

- Sin Docker. SQLite solo en dev como conveniencia; en Vercel **debes** usar Postgres (Supabase/Neon) porque el filesystem es efímero.
- `bcryptjs` (puro JS) en vez de `bcrypt` para evitar problemas de compilación nativa en serverless.
- La inicialización de la base de datos (auth + sync + seed de roles) se ejecuta de forma perezosa y cacheada en la primera invocación.
