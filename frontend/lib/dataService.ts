// lib/dataService.ts
// ÚNICO punto de acceso a datos — Capa de persistencia centralizada

import { supabaseAdmin } from './supabase';
import { isSupabaseConfigured } from './supabase';
import { getSeedAdmin, getSeedRooms, getSeedUsers } from './seedReader';
import { recordAudit, createAuditEntry } from './blobAudit';
import { verifyPassword, hashPassword } from './auth';
import type {
  User,
  SafeUser,
  Room,
  Client,
  Reservation,
  AuditAction,
  AuditEntity,
  UserRole,
} from './types';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from './types';

/**
 * Determina el modo de operación del sistema
 * - seed: sin Supabase configurado, usando datos de data/seed.json
 * - live: Supabase configurado y disponible
 */
export async function getSystemMode(): Promise<'seed' | 'live'> {
  if (!isSupabaseConfigured()) {
    return 'seed';
  }

  try {
    if (!supabaseAdmin) {
      return 'seed';
    }

    // Intentar una query simple para verificar conectividad
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Supabase error, usando seed:', error);
      return 'seed';
    }

    return 'live';
  } catch (error) {
    console.warn('Error verificando Supabase:', error);
    return 'seed';
  }
}

// ============================================================================
// AUTH Y USUARIOS
// ============================================================================

/**
 * Busca un usuario por email
 * En modo seed: busca en los datos del seed
 * En modo live: busca en Supabase
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seedUsers = getSeedUsers();
    return seedUsers.find(u => u.email === email) || null;
  }

  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Busca un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seedUsers = getSeedUsers();
    return seedUsers.find(u => u.id === id) || null;
  }

  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Verifica credenciales y retorna el usuario si son válidas
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  // En modo seed, permitir acceso con admin123 para el SuperAdmin
  const mode = await getSystemMode();
  if (mode === 'seed' && user.role === 'superadmin') {
    // Validar contraseña hasheada
    if (verifyPassword(password, user.password_hash)) {
      return user;
    }
  }

  // En modo live, siempre validar contraseña
  if (mode === 'live') {
    if (verifyPassword(password, user.password_hash)) {
      return user;
    }
  }

  return null;
}

/**
 * Crea un nuevo usuario (solo SuperAdmin)
 */
export async function createUser(name: string, email: string, role: UserRole): Promise<User> {
  if (!supabaseAdmin) {
    throw new ValidationError('Supabase no configurado');
  }

  // Generar contraseña temporal
  const tempPassword = Math.random().toString(36).substring(2, 10);
  const passwordHash = hashPassword(tempPassword);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      email,
      role,
      password_hash: passwordHash,
      is_active: true,
      must_change_password: true,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique')) {
      throw new ConflictError('El email ya existe');
    }
    throw new ValidationError(error.message);
  }

  return {
    ...data as User,
    password_hash: tempPassword, // Retornar la contraseña temporal una sola vez
  };
}

/**
 * Actualiza un usuario
 */
export async function updateUser(
  id: string,
  updates: { name?: string; is_active?: boolean }
): Promise<SafeUser> {
  if (!supabaseAdmin) {
    throw new ValidationError('Supabase no configurado');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const user = data as User;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };
}

/**
 * Cambia la contraseña de un usuario autenticado
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new ConflictError('La contraseña actual es incorrecta');
  }

  if (!supabaseAdmin) {
    throw new ValidationError('Supabase no configurado');
  }

  const newHash = hashPassword(newPassword);

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      password_hash: newHash,
      must_change_password: false,
    })
    .eq('id', userId);

  if (error) {
    throw new ValidationError('Error al cambiar contraseña');
  }

  await recordAudit(
    createAuditEntry(userId, user.email, user.role, 'login', 'user', 'Contraseña cambiada')
  );
}

/**
 * Retorna todos los usuarios (sin contraseñas)
 */
export async function listUsers(): Promise<SafeUser[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return getSeedUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
    }));
  }

  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, is_active, last_login_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data as SafeUser[];
}

// ============================================================================
// HABITACIONES
// ============================================================================

/**
 * Retorna todas las habitaciones (con filtros opcionales)
 */
export async function getRooms(filters?: { type?: string; status?: string }): Promise<Room[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    let rooms = getSeedRooms();

    if (filters?.type) {
      rooms = rooms.filter(r => r.type === filters.type);
    }

    if (filters?.status) {
      rooms = rooms.filter(r => r.status === filters.status);
    }

    return rooms;
  }

  if (!supabaseAdmin) {
    return [];
  }

  let query = supabaseAdmin.from('rooms').select('*');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('room_number', { ascending: true });

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data as Room[];
}

/**
 * Retorna una habitación por ID
 */
export async function getRoomById(id: string): Promise<Room | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const rooms = getSeedRooms();
    return rooms.find(r => r.id === id) || null;
  }

  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Room;
}

// ============================================================================
// AUDITORÍA
// ============================================================================

/**
 * Registra una acción en la auditoría
 */
export async function recordUserAudit(
  userId: string,
  userEmail: string,
  userRole: UserRole,
  action: AuditAction,
  entity: AuditEntity,
  summary: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const entry = createAuditEntry(
    userId,
    userEmail,
    userRole,
    action,
    entity,
    summary,
    entityId,
    metadata
  );

  await recordAudit(entry);
}

/**
 * Actualiza el último login
 */
export async function updateLastLogin(userId: string): Promise<void> {
  if (!supabaseAdmin) {
    return;
  }

  await supabaseAdmin
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId);
}
