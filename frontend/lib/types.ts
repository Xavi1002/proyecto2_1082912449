// lib/types.ts
// Tipos centrales de HotelManager Pro

export type SystemMode = 'seed' | 'live';
export type UserRole = 'superadmin' | 'recepcionista' | 'cliente';
export type RoomStatus = 'disponible' | 'ocupada' | 'mantenimiento';
export type RoomType = 'simple' | 'doble' | 'suite';
export type ReservationStatus = 'activa' | 'completada' | 'cancelada';

// Usuario en el sistema
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at?: string;
  created_at: string;
}

// Usuario seguro (sin contraseña)
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

// JWT Payload
export interface JWTPayload {
  [key: string]: unknown;
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Habitación
export interface Room {
  id: string;
  room_number: string;
  type: RoomType;
  status: RoomStatus;
  price_per_night: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Cliente
export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  identification_number: string;
  created_at: string;
  updated_at: string;
}

// Reserva
export interface Reservation {
  id: string;
  room_id: string;
  client_id: string;
  check_in: string;
  check_out: string;
  price_per_night_snapshot: number;
  total_amount: number;
  status: ReservationStatus;
  created_by: string;
  cancelled_by?: string;
  cancelled_at?: string;
  created_at: string;
}

// Entrada de auditoría
export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create_room'
  | 'update_room'
  | 'delete_room'
  | 'change_room_status'
  | 'create_client'
  | 'update_client'
  | 'delete_client'
  | 'create_reservation'
  | 'cancel_reservation'
  | 'create_user'
  | 'toggle_user'
  | 'bootstrap';

export type AuditEntity = 'room' | 'client' | 'reservation' | 'user' | 'system';

// Dashboard
export interface DashboardData {
  rooms_available: number;
  rooms_occupied: number;
  rooms_maintenance: number;
  reservations_today: number;
  next_check_ins: Reservation[];
  next_check_outs: Reservation[];
}

// Errores del sistema
export class HotelManagerError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HotelManagerError';
  }
}

export class ConflictError extends HotelManagerError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
  }
}

export class UnauthorizedError extends HotelManagerError {
  constructor(message: string = 'No autorizado') {
    super('UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends HotelManagerError {
  constructor(message: string = 'Acceso denegado') {
    super('FORBIDDEN', 403, message);
  }
}

export class NotFoundError extends HotelManagerError {
  constructor(message: string = 'No encontrado') {
    super('NOT_FOUND', 404, message);
  }
}

export class ValidationError extends HotelManagerError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}
