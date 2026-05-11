-- Fase 1: Inicializar usuarios y migrations
-- HotelManager Pro - Migration 0001_init_users

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(120) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL DEFAULT 'recepcionista'
                       CHECK (role IN ('superadmin', 'recepcionista', 'cliente')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Registrar esta migración
INSERT INTO _migrations (filename) VALUES ('0001_init_users.sql') ON CONFLICT DO NOTHING;
