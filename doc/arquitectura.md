# Plan de Arquitectura - Sistema de Gestión Hotelera

## 1. Descripción General

El sistema será una aplicación web para la gestión de un hotel, permitiendo administrar habitaciones, reservas, clientes y personal.

## 2. Arquitectura General

Se utilizará una arquitectura cliente-servidor (MVC):

- **Frontend:** Interfaz web moderna
- **Backend:** API REST
- **Base de datos:** Sistema relacional

## 3. Tecnologías

### Frontend
- React / Next.js
- Tailwind CSS (para diseño profesional)
- Axios (peticiones HTTP)

### Backend
- Node.js + Express

### Base de Datos
- PostgreSQL o MySQL

### Autenticación
- JWT (JSON Web Tokens)

## 4. Módulos del Sistema

### 4.1 Autenticación
- Registro de usuarios
- Inicio de sesión
- Roles:
  - SuperAdmin
  - Recepción
  - Cliente

### 4.2 Gestión de Habitaciones
- Crear, editar y eliminar habitaciones
- Tipos de habitación (simple, doble, suite)
- Estado (disponible, ocupada, mantenimiento)

### 4.3 Gestión de Reservas
- Crear reservas
- Asignar habitación
- Fechas de entrada/salida

### 4.4 Gestión de Clientes
- Registro de clientes
- Historial de reservas

### 4.5 Panel Principal
- Vista general del hotel
- Habitaciones disponibles
- Reservas activas

### 4.6 Buscador
- Buscar clientes por nombre
- Buscar reservas activas

## 5. Seguridad
- Encriptación de contraseñas (bcrypt)
- Middleware de autenticación
- Control de acceso por roles

## 6. Diseño UI/UX
- Interfaz limpia y profesional
- Dashboard moderno
- Responsive (adaptable a móviles)
