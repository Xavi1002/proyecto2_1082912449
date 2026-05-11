// lib/seedReader.ts
// Lee datos de inicialización desde data/seed.json

import { readFileSync } from 'fs';
import { join } from 'path';
import type { User, Room } from './types';

interface SeedData {
  users: Array<{
    email: string;
    password_hash: string;
    name: string;
    role: 'superadmin' | 'recepcionista' | 'cliente';
  }>;
  rooms: Array<{
    room_number: string;
    type: 'simple' | 'doble' | 'suite';
    status: 'disponible' | 'ocupada' | 'mantenimiento';
    price_per_night: number;
  }>;
}

let _seedData: SeedData | null = null;

/**
 * Lee el archivo seed.json desde el directorio data/
 * Se cachea en memoria después de la primera lectura
 */
function loadSeedData(): SeedData {
  if (_seedData) {
    return _seedData;
  }

  try {
    const seedPath = join(process.cwd(), 'data', 'seed.json');
    const content = readFileSync(seedPath, 'utf-8');
    _seedData = JSON.parse(content);
    return _seedData;
  } catch (error) {
    console.error('Error loading seed.json:', error);
    return { users: [], rooms: [] };
  }
}

/**
 * Retorna el SuperAdmin del seed
 */
export function getSeedAdmin(): User | null {
  const seed = loadSeedData();
  const adminData = seed.users.find(u => u.role === 'superadmin');

  if (!adminData) return null;

  return {
    id: 'seed-admin-001', // ID fijo para modo seed
    email: adminData.email,
    name: adminData.name,
    role: adminData.role,
    password_hash: adminData.password_hash,
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Retorna las 4 habitaciones demo del seed
 */
export function getSeedRooms(): Room[] {
  const seed = loadSeedData();

  return seed.rooms.map((room, idx) => ({
    id: `seed-room-${String(idx + 1).padStart(3, '0')}`,
    room_number: room.room_number,
    type: room.type,
    status: room.status,
    price_per_night: room.price_per_night,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Retorna todos los usuarios del seed (solo para debug/bootstrap)
 */
export function getSeedUsers(): User[] {
  const seed = loadSeedData();

  return seed.users.map((user, idx) => ({
    id: `seed-user-${String(idx + 1).padStart(3, '0')}`,
    email: user.email,
    name: user.name,
    role: user.role,
    password_hash: user.password_hash,
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
  }));
}
