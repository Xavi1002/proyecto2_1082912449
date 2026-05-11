# Datos de Semilla (Seed)

Este directorio contiene datos de inicialización para HotelManager Pro.

## Archivos

- **config.json**: Configuración del sistema (versión, nombre)
- **seed.json**: Datos iniciales:
  - SuperAdmin con credenciales de bootstrap
  - 4 habitaciones demo

## Flujo de Bootstrap

1. El sistema arranca sin Supabase configurado (modo seed)
2. El `seedReader.ts` carga estos datos
3. El login permite acceder con las credenciales del SuperAdmin
4. Una vez en el panel, `/admin/db-setup` permite aplicar migrations y cargar en BD
5. El sistema cambia a modo live

## Notas de Seguridad

- El hash de `admin123` solo se usa en desarrollo/bootstrap
- La contraseña debe ser cambiad después del primer login en producción
- Los datos aquí son read-only
