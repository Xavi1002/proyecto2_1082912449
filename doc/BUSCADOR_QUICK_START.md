# 🔍 Buscador de Clientes - Quick Start

> Guía rápida para empezar a usar el buscador en 2 minutos

## ⚡ Inicio Rápido

### Paso 1: Acceder al Buscador
1. Haz clic en **"Buscador"** en la barra de navegación
2. O ve directamente a: `http://localhost:3000/search`
3. Debes estar logueado

### Paso 2: Buscar un Cliente
```
1. Escribe el nombre del cliente en el campo
2. Ejemplo: "juan", "María", "carlos"
3. Los resultados aparecen automáticamente (500ms después de escribir)
4. No necesitas hacer clic en "Buscar"
```

### Paso 3: Ver Sus Reservas
```
1. Haz clic en el cliente que buscas
2. Verás todas sus reservas con:
   - Fechas de entrada/salida
   - Habitación asignada
   - Número de noches
   - Precio total
   - Estado actual
```

### Paso 4: Volver o Buscar de Nuevo
```
- Haz clic en "Volver" para regresarse a resultados
- Haz clic en "Limpiar" para nueva búsqueda
```

---

## 🎯 Casos de Uso Rápidos

### "Necesito ver todas las reservas de Juan"
```
Buscador → "juan" → Esperar → Click en "Juan García" → ✅ Listo
```

### "¿Este cliente tiene reservas activas?"
```
Buscador → nombre → Click → Ver lista → Revisar estados → ✅ Listo
```

### "¿Cuánto gastó este cliente?"
```
Buscador → nombre → Click → Sumar precios en reservas → ✅ Listo
```

---

## 💡 Tips & Tricks

| Tip | Cómo |
|-----|------|
| **Búsqueda flexible** | "jua" encuentra "Juan" |
| **Insensible a mayúsculas** | "JUAN" = "juan" = "Juan" |
| **Sin espacio inicial** | El campo quita espacios automáticamente |
| **Búsqueda automática** | No necesitas hacer clic en "Buscar" |
| **Solo activos** | Solo muestra clientes activos |
| **Solo clientes** | No busca administradores |
| **Máximo 50 resultados** | Si hay más, afina la búsqueda |

---

## ⚠️ Situaciones Comunes

### "No encuentro al cliente"
**Soluciones**:
- ✓ Verifica la ortografía del nombre
- ✓ Intenta solo parte del nombre ("jua" en lugar de "juan garcía")
- ✓ Revisa si el cliente está activo en el sistema

### "La búsqueda es lenta"
**Es normal** porque:
- Debounce espera 500ms después de escribir
- Es para reducir carga del servidor
- Es el comportamiento esperado

### "¿Puedo buscar por email?"
**No actualmente**, pero:
- Puedes hacerlo si el nombre contiene parte del email
- Esta mejora está planeada

---

## 🎨 Entender la Pantalla

### Campo de Búsqueda
```
┌─────────────────────────────────┬────────┬──────────┐
│ Buscar cliente por nombre...    │ Buscar │ Limpiar  │
└─────────────────────────────────┴────────┴──────────┘
💡 La búsqueda se realiza automáticamente mientras escribes
```

### Resultados
```
Clientes encontrados (3)

┌──────────────────────────────────────────┐
│ Juan García                    Ver detalle│
│ juan.garcia@email.com                     │
│ Ver reservas                              │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Juana López                    Ver detalle│
│ juana.lopez@email.com                     │
│ Ver reservas                              │
└──────────────────────────────────────────┘
```

### Detalles de Cliente
```
┌────────────────────────────────────────────┐
│ Juan García                            [Volver]
│ juan.garcia@email.com
│ ID: 123
└────────────────────────────────────────────┘

Reservas de Juan García (5)

Confirmada ✓
01 may a 05 may | 4 noches | Habitación 101 (Doble) | $400.00

Completada ✓  
15 abr a 20 abr | 5 noches | Habitación 205 (Triple) | $500.00

... más reservas ...
```

---

## 🔑 Teclas de Acceso Rápido

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre campos |
| `Enter` | Forzar búsqueda (opcional) |
| `Esc` | En el futuro: cerrar (No implementado) |

---

## 📊 Información que Verás

Por cada cliente encuentras:
- ✅ Nombre completo
- ✅ Email
- ✅ ID en el sistema

Por cada reserva:
- ✅ Fecha entrada y salida
- ✅ Número de noches
- ✅ Número de huéspedes
- ✅ Habitación (número y tipo)
- ✅ Precio total
- ✅ Estado (Confirmada, Pendiente, Cancelada, Completada)

---

## 🚀 Lo Que Es Posible (Hoy)

✅ Buscar clientes por nombre  
✅ Ver todas sus reservas  
✅ Ver detalles de cada reserva  
✅ Identificar clientes activos  
✅ Verificar histórico de reservas  

---

## 📋 Lo Que Viene (Futuro)

🔜 Buscar por email  
🔜 Búsqueda avanzada (fechas, estado)  
🔜 Paginación para >50 resultados  
🔜 Exportar datos a CSV  
🔜 Gráficos de gastos del cliente  

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito estar logueado?**  
R: Sí, es una funcionalidad protegida.

**P: ¿Es seguro?**  
R: Sí, requiere autenticación y solo accedes a datos de clientes.

**P: ¿Puedo ver datos privados?**  
R: No, las contraseñas nunca se muestran.

**P: ¿Es en tiempo real?**  
R: Prácticamente sí (con debounce de 500ms).

**P: ¿Funciona en móvil?**  
R: Sí, es responsivo.

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| Botón "Buscar" no funciona | El campo debe tener texto |
| No aparecen resultados | Espera 500ms después de escribir |
| Botón "Limpiar" no funciona | Solo aparece si hay búsqueda previa |
| "Error al buscar" | Verifica conexión a internet |
| Página no carga | Verifica estar logueado |

---

## 📞 Soporte

**Más información**:
- Guía completa: `BUSCADOR_CLIENTES.md`
- Documentación técnica: `DESARROLLO_BUSCADOR.md`
- Índice de docs: `INDICE_DOCUMENTACION.md`

**¿Tienes un problema?**:
- Revisa la sección "⚠️ Situaciones Comunes"
- Consulta "❓ Preguntas Frecuentes"
- Lee `BUSCADOR_CLIENTES.md` sección Troubleshooting

---

**¡Listo! Ya sabes cómo usar el buscador. ¡Adelante!** 🚀
