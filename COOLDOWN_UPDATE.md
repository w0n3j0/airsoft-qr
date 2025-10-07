# ⏱️ ACTUALIZACIÓN: COOLDOWN A 1 HORA

**Fecha:** 6 de octubre de 2025  
**Commit:** eea7633  
**Cambio:** Cooldown aumentado de 30 minutos a 60 minutos (1 hora)

---

## 📋 Cambios Aplicados

### 1. Código JavaScript (`app.js`)

**Antes:**
```javascript
const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
```

**Ahora:**
```javascript
const COOLDOWN_DURATION = 60 * 60 * 1000; // 60 minutos (1 hora) en milisegundos
```

### 2. Documentación Actualizada

Se actualizaron todas las menciones del cooldown en:

- ✅ **README.md** (7 menciones)
  - Características principales
  - Flujo de captura
  - Configuración de `config.json`
  - Seguridad backend
  - Troubleshooting

- ✅ **examples/README.md** (1 mención)
  - Validación en backend

- ✅ **demo.html** (1 mención)
  - Instrucciones de uso

- ✅ **test-capture.html** (1 mención)
  - Advertencia de testing

- ✅ **CAMBIOS.txt** (1 nota agregada)

---

## 🎯 Impacto del Cambio

### En el Frontend
- Los usuarios ahora deben esperar **1 hora** después de capturar una base
- El contador de cooldown mostrará hasta 60 minutos
- LocalStorage almacena el timestamp por 60 minutos

### En el Backend (Power Automate)
⚠️ **IMPORTANTE:** Si tienes validación de cooldown en Power Automate, debes actualizar:

```
Timestamp + 30 minutos < Ahora
```

**Cambiar a:**
```
Timestamp + 60 minutos < Ahora
```

O usando `addMinutes()`:
```
addMinutes(Timestamp, 60) < utcNow()
```

---

## 🧪 Cómo Probar el Nuevo Cooldown

### 1. Limpiar Cache
```javascript
// En consola del navegador:
localStorage.clear();
```

### 2. Capturar Base
- Abre http://localhost:8080/?team=india
- Completa el mini-juego
- Verifica que aparece la pantalla de cooldown

### 3. Verificar Tiempo
```javascript
// En consola del navegador:
const cooldownKey = 'captureCooldown:india';
const timestamp = localStorage.getItem(cooldownKey);
const msLeft = (60 * 60 * 1000) - (Date.now() - timestamp);
const minutesLeft = Math.floor(msLeft / 60000);
console.log(`Quedan ${minutesLeft} minutos de cooldown`);
```

---

## 📊 Estadísticas del Commit

```
6 archivos modificados:
- app.js
- README.md
- examples/README.md
- demo.html
- test-capture.html
- CAMBIOS.txt (nuevo)

304 líneas agregadas
12 líneas eliminadas
```

---

## ⚙️ Configuración Personalizada

Si en el futuro quieres cambiar el tiempo de cooldown, solo modifica en `app.js`:

```javascript
// Ejemplos:
const COOLDOWN_DURATION = 15 * 60 * 1000;  // 15 minutos
const COOLDOWN_DURATION = 30 * 60 * 1000;  // 30 minutos
const COOLDOWN_DURATION = 60 * 60 * 1000;  // 1 hora (actual)
const COOLDOWN_DURATION = 120 * 60 * 1000; // 2 horas
```

También puedes configurarlo en `config.json`:
```json
{
  "cooldownMinutes": 60  // Cambiar aquí
}
```

---

## 🚀 Deploy

Los cambios ya están en GitHub:
- **Commit:** eea7633
- **Branch:** main
- **GitHub Pages:** Se actualizará en 1-2 minutos

Para verificar en producción:
```
https://w0n3j0.github.io/airsoft-qr/?team=india
```

---

## ✅ Checklist de Verificación

- [x] Código actualizado (app.js)
- [x] Documentación actualizada (README.md)
- [x] Ejemplos actualizados (examples/README.md)
- [x] Demo actualizado (demo.html)
- [x] Test actualizado (test-capture.html)
- [x] Commit creado y pusheado
- [ ] Verificar en GitHub Pages
- [ ] Actualizar Power Automate (si aplica)
- [ ] Probar con dispositivo real

---

## 🔗 Enlaces Útiles

- **Repositorio:** https://github.com/w0n3j0/airsoft-qr
- **Commit directo:** https://github.com/w0n3j0/airsoft-qr/commit/eea7633
- **GitHub Pages:** https://w0n3j0.github.io/airsoft-qr/

---

**Estado:** ✅ Completado y desplegado  
**Última actualización:** 6 de octubre de 2025
