# Proyecto 2 - Fullstack Application

Proyecto fullstack completo con Next.js (frontend), Express (backend) y PostgreSQL (base de datos).

## Estructura del Proyecto

```
proyecto2_1082912449/
├── frontend/           # Aplicación Next.js (React)
│   ├── src/
│   │   ├── pages/      # Páginas y rutas
│   │   ├── components/ # Componentes reutilizables
│   │   ├── lib/        # Utilidades y helpers
│   │   └── styles/     # Estilos
│   ├── public/         # Archivos estáticos
│   └── package.json
├── backend/            # API REST con Express
│   ├── src/
│   │   ├── config/     # Configuración de BD
│   │   ├── models/     # Modelos Sequelize
│   │   ├── controllers/# Lógica de negocio
│   │   ├── routes/     # Rutas de la API
│   │   ├── middleware/ # Middlewares
│   │   └── utils/      # Funciones utilitarias
│   └── package.json
├── doc/                # Documentación del proyecto
├── docker-compose.yml  # Configuración Docker para PostgreSQL
└── README.md           # Este archivo
```

## Características Principales

- ✅ Sistema de autenticación JWT completo
- ✅ Registro e inicio de sesión seguros
- ✅ Sistema de roles (SuperAdmin, Recepción, Cliente)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rutas protegidas en frontend
- ✅ API REST escalable
- ✅ Base de datos PostgreSQL
- ✅ Docker para desarrollo

## Módulos Implementados

- Node.js 18+
- npm o yarn
- Docker y Docker Compose (opcional, para PostgreSQL)

## Instalación y Configuración

### 1. Base de Datos (PostgreSQL)

Opción A: Usando Docker Compose (recomendado)
```bash
docker-compose up -d
```

Opción B: PostgreSQL local
Crear base de datos manualmente:
```sql
CREATE DATABASE proyecto2_db;
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### 3. Frontend

En otra terminal:
```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Variables de Entorno

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto2_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Desarrollo

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 - PostgreSQL (si usas Docker)
```bash
docker-compose up
```

## Build para Producción

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## API Endpoints

### Health Check
- `GET /api/health` - Estado del servidor

### Usuarios
- `GET /api/users` - Obtener todos
- `GET /api/users/:id` - Obtener por ID
- `POST /api/users` - Crear nuevo
- `PUT /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar

## Tecnologías Utilizadas

### Frontend
- Next.js 14
- React 18
- TypeScript
- Axios

### Backend
- Express.js
- TypeScript
- Sequelize (ORM)
- PostgreSQL

### DevOps
- Docker
- Docker Compose

## Documentación

Ver archivos en la carpeta `doc/`:
- [arquitectura.md](doc/arquitectura.md) - Arquitectura del sistema
- [estado.md](doc/estado.md) - Estado del proyecto
- [implementacion.md](doc/implementacion.md) - Detalles de implementación
- [prompts.md](doc/prompts.md) - Prompts de desarrollo
- [autenticacion.md](doc/autenticacion.md) - Sistema de autenticación con JWT
- [API_TESTS.md](doc/API_TESTS.md) - Pruebas de endpoints de API

## Guía Rápida

Ver [QUICKSTART.md](QUICKSTART.md) para instrucciones de inicio rápido.

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Obtener todos
- `GET /api/users/:id` - Obtener por ID
- `POST /api/users` - Crear nuevo
- `PUT /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar

## Licencia

ISC

## Autor

Xavi
