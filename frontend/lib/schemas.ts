// lib/schemas.ts
// Esquemas Zod para validación de entrada

import { z } from 'zod';

// Login
export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Cambiar contraseña
export const ChangePasswordRequestSchema = z.object({
  current_password: z.string().min(6, 'Contraseña actual inválida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Crear usuario
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  role: z.enum(['superadmin', 'recepcionista', 'cliente']),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

// Crear habitación
export const CreateRoomRequestSchema = z.object({
  room_number: z.string().min(1, 'Número de habitación requerido'),
  type: z.enum(['simple', 'doble', 'suite']),
  price_per_night: z.number().positive('El precio debe ser positivo'),
  description: z.string().optional(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

// Actualizar habitación
export const UpdateRoomRequestSchema = CreateRoomRequestSchema.partial();
export type UpdateRoomRequest = z.infer<typeof UpdateRoomRequestSchema>;

// Crear cliente
export const CreateClientRequestSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  identification_number: z.string().min(5, 'Número de documento inválido'),
  create_user: z.boolean().optional(),
});

export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;

// Actualizar cliente
export const UpdateClientRequestSchema = CreateClientRequestSchema.partial();
export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;

// Crear reserva
export const CreateReservationRequestSchema = z.object({
  room_id: z.string().uuid('Room ID inválido'),
  client_id: z.string().uuid('Client ID inválido'),
  check_in: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha de entrada inválida'),
  check_out: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha de salida inválida'),
}).refine(data => new Date(data.check_out) > new Date(data.check_in), {
  message: 'La fecha de salida debe ser posterior a la de entrada',
  path: ['check_out'],
});

export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>;
