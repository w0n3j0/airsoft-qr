# 🚀 Sistema de Misiles V2 - Cuenta Regresiva

**Fecha**: 18 de Noviembre, 2025  
**Versión**: 2.0 - Sistema con Cuenta Regresiva

---

## 📊 Estados de los Misiles

El sistema de misiles ahora incluye una **cuenta regresiva de 60 minutos** antes del lanzamiento.

### Estados Disponibles:

| Estado | Icono | Descripción | Color | Acción Posible |
|--------|-------|-------------|-------|----------------|
| **Armado** | 🔴 | Estado inicial, listo para iniciar conteo | Rojo | Iniciar cuenta regresiva |
| **Conteo** | ⏳ | Cuenta regresiva activa (60 min) | Naranja | Desactivar misil |
| **Lanzado** | 🚀 | Pasaron 60 min, misil lanzado | Naranja | Ninguna |
| **Desactivado** | 🟢 | Misil neutralizado | Verde | Ninguna |

---

## 🎮 Flujo de Juego

### Escenario 1: Lanzamiento Exitoso
```
1. Equipo A escanea QR "Lanzar Misil 1"
2. Estado cambia: Armado → Conteo
3. Inicia cuenta regresiva de 60 minutos
4. Equipo B no logra desactivar a tiempo
5. Estado cambia: Conteo → Lanzado
6. ¡Misil impacta!
```

### Escenario 2: Desactivación Exitosa
```
1. Equipo A escanea QR "Lanzar Misil 1"
2. Estado cambia: Armado → Conteo
3. Inicia cuenta regresiva de 60 minutos
4. Equipo B encuentra el QR de "Desactivar Misil 1"
5. Equipo B escanea y desactiva con 23:45 restantes
6. Estado cambia: Conteo → Desactivado
7. ¡Misil neutralizado!
```

### Escenario 3: Intento Tardío
```
1. Equipo A escanea QR "Lanzar Misil 1"
2. Pasan 60 minutos
3. Estado automático: Conteo → Lanzado
4. Equipo B intenta desactivar
5. Mensaje: "Este misil ya fue lanzado. Ya no puede ser desactivado."
```

---

## 🔧 Configuración del Backend (Power Automate)

### Payload de Iniciar Conteo

**Endpoint**: `missileLaunchUrl` o `missileApiUrl`  
**Método**: POST  
**Action**: `"initiate"`

```json
{
  "missile": "1",
  "action": "initiate",
  "ts": "2025-11-18T14:30:00.000Z",
  "deviceId": "device-abc123...",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 10
  }
}
```

**Flow debe:**
1. Recibir el payload
2. Cambiar estado en SharePoint a: `"Conteo"`
3. Guardar timestamp en `field_3`
4. Guardar deviceId, location, etc.

---

### Payload de Desactivar

**Endpoint**: `missileApiUrl`  
**Método**: POST  
**Action**: `"deactivate"`

```json
{
  "missile": "1",
  "action": "deactivate",
  "ts": "2025-11-18T15:15:00.000Z",
  "deviceId": "device-xyz789...",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83200,
    "lng": -60.70600,
    "accuracy": 15
  }
}
```

**Flow debe:**
1. Recibir el payload
2. Verificar estado actual
3. Si está en "Conteo" → Cambiar a `"Desactivado"`
4. Si está en "Armado" → Cambiar a `"Desactivado"`
5. Si está en "Lanzado" → Retornar error
6. Guardar timestamp de desactivación

---

### Verificación Automática (60 minutos)

**Opción 1: Flow Programado** (Recomendado)
- Crear un Flow que se ejecute cada 5 minutos
- Buscar misiles con estado "Conteo"
- Calcular tiempo transcurrido desde `field_3`
- Si pasaron ≥60 min → Cambiar estado a "Lanzado"

**Opción 2: Verificación en Frontend**
- El frontend verifica al cargar si pasaron 60 minutos
- Muestra automáticamente el estado "Lanzado"
- Requiere recarga manual del backend

---

## 📋 Campos en SharePoint

### Lista: "Misiles"

| Campo | Nombre Interno | Tipo | Valores Posibles | Descripción |
|-------|---------------|------|------------------|-------------|
| Título | `Title` | Single line | "1", "2", "3" | Número del misil |
| Estado | `field_1` | Choice | "Armado", "Conteo", "Lanzado", "Desactivado" | Estado actual |
| Device ID | `field_2` | Single line | UUID | Dispositivo que realizó la acción |
| Timestamp | `field_3` | Date/Time | ISO 8601 | Momento de la acción |
| Latitud | `field_4` | Number | -90 a 90 | Coordenada GPS |
| Longitud | `field_5` | Number | -180 a 180 | Coordenada GPS |
| Precisión | `field_6` | Number | Metros | Precisión del GPS |

**Valores del campo `field_1` (Estado):**
- `"Armado"` - Estado inicial
- `"Conteo"` - Cuenta regresiva en progreso
- `"Lanzado"` - Misil lanzado (60 min transcurridos)
- `"Desactivado"` - Misil neutralizado

---

## 🎨 Interfaz de Usuario

### lanzar-misil.html

**Estados visuales:**

1. **Armado** (Inicial)
   - Badge: `🔴 LISTO PARA LANZAR`
   - Botón: `🚀 LANZAR MISIL` (activo)

2. **Conteo** (Después de escanear)
   - Badge: `⏳ CUENTA REGRESIVA`
   - Botón: `CONTEO EN PROGRESO` (deshabilitado)
   - Muestra: Tiempo restante (HH:MM:SS)
   - Actualización: Cada 1 segundo

3. **Lanzado**
   - Badge: `🚀 YA LANZADO`
   - Botón: `YA LANZADO` (deshabilitado)
   - Mensaje: Fecha de lanzamiento

4. **Desactivado**
   - Badge: `🔴 DESACTIVADO`
   - Botón: `DESACTIVADO` (deshabilitado)
   - Mensaje: No puede ser lanzado

---

### misil.html

**Estados visuales:**

1. **Armado**
   - Badge: `🔴 ARMADO`
   - Botón: `🛡️ DESACTIVAR AHORA` (activo)

2. **Conteo** (¡CRÍTICO!)
   - Badge: `⏳ CUENTA REGRESIVA`
   - Botón: `🛡️ DESACTIVAR AHORA` (activo, urgente)
   - Mensaje: `⚠️ ¡URGENTE! Tiempo restante: HH:MM:SS`
   - Actualización: Cada 1 segundo

3. **Lanzado**
   - Badge: `🚀 LANZADO`
   - Botón: `YA LANZADO` (deshabilitado)
   - Mensaje: Ya no puede ser desactivado

4. **Desactivado**
   - Badge: `🟢 DESACTIVADO`
   - Botón: `YA DESACTIVADO` (deshabilitado)
   - Mensaje: Fecha de desactivación

---

### metrics.html

**Dashboard muestra:**

| Misil | Estado | Tiempo/Info |
|-------|--------|-------------|
| Misil 1 | 🔴 ARMADO | Esperando acción... |
| Misil 2 | ⏳ CUENTA REGRESIVA | ⏱️ Tiempo restante: 00:42:15 |
| Misil 3 | 🟢 DESACTIVADO | Desactivado 18/11 15:30 |

**Actualización automática:**
- Los misiles en "Conteo" actualizan el contador cada 1 segundo
- Sin necesidad de recargar la página

---

## ⚡ Características Técnicas

### Actualización en Tiempo Real

**lanzar-misil.html:**
- Verifica estado al cargar
- Si está en "Conteo", inicia contador local
- Actualiza cada 1 segundo
- Si pasan 60 min, muestra "Lanzado"

**misil.html:**
- Verifica estado al cargar
- Si está en "Conteo", muestra alerta urgente
- Actualiza cada 1 segundo
- Permite desactivar mientras haya tiempo

**metrics.html:**
- Intervalo cada 1 segundo
- Solo re-renderiza si hay misiles en "Conteo"
- Calcula tiempo restante dinámicamente

---

## 🔄 Switch en Power Automate

```
Trigger: When a HTTP request is received
  ↓
Parse JSON: triggerBody()
  ↓
Switch: @triggerBody()['action']
  ↓
  ├─ Case "initiate":
  │   └─ Update SharePoint Item
  │       - Estado = "Conteo"
  │       - field_3 = triggerBody()['ts']
  │       - field_2 = triggerBody()['deviceId']
  │       - field_4 = triggerBody()['location']['lat']
  │       - field_5 = triggerBody()['location']['lng']
  │       - field_6 = triggerBody()['location']['accuracy']
  │   └─ Response: { "success": true }
  │
  ├─ Case "deactivate":
  │   ├─ Get SharePoint Item (verificar estado actual)
  │   ├─ Condition: Estado != "Lanzado"
  │   │   ├─ Yes: Update SharePoint Item
  │   │   │   - Estado = "Desactivado"
  │   │   │   - field_3 = triggerBody()['ts']
  │   │   │   - ...otros campos...
  │   │   │   └─ Response: { "success": true }
  │   │   └─ No: Response: { "error": "Ya lanzado" }
  │
  └─ Default:
      └─ Response: { "error": "Acción no válida" }
```

---

## 🎯 Ejemplo Completo

### Paso a Paso:

**Minuto 0:**
```
Usuario escanea: lanzar-misil.html?missile=1
Action: "initiate"
SharePoint: Estado = "Conteo", Timestamp = "14:00:00"
Pantalla: "¡CUENTA REGRESIVA INICIADA! El misil será lanzado en 60 minutos"
```

**Minuto 15:**
```
Usuario escanea: misil.html?missile=1
SharePoint consulta: Estado = "Conteo", Timestamp = "14:00:00"
Calcula: Transcurridos 15 min, Restan 45 min
Pantalla: "⚠️ ¡URGENTE! Tiempo restante: 00:45:00 ¡DESACTIVA EL MISIL AHORA!"
Botón: DESACTIVAR AHORA (activo)
```

**Minuto 23:**
```
Usuario pulsa: DESACTIVAR AHORA
Action: "deactivate"
SharePoint: Estado = "Conteo" → "Desactivado"
Pantalla: "✅ MISIL DESACTIVADO - Misil 1 neutralizado"
```

**Resultado:**
- Misil desactivado con éxito ✅
- Tiempo sobrante: 37 minutos
- Equipo defensor gana puntos

---

## 📱 QR Codes

### Imprimir 6 QR Codes (2 por misil):

**Misil 1:**
- 🔴 **Lanzar**: `lanzar-misil.html?missile=1` (QR Rojo/Naranja)
- 🔵 **Desactivar**: `misil.html?missile=1` (QR Azul)

**Misil 2:**
- 🔴 **Lanzar**: `lanzar-misil.html?missile=2` (QR Rojo/Naranja)
- 🔵 **Desactivar**: `misil.html?missile=2` (QR Azul)

**Misil 3:**
- 🔴 **Lanzar**: `lanzar-misil.html?missile=3` (QR Rojo/Naranja)
- 🔵 **Desactivar**: `misil.html?missile=3` (QR Azul)

---

## 🐛 Troubleshooting

### "Could not execute workflow... trigger is not enabled"
- El Flow está desactivado
- Ir a Power Automate y activarlo

### "The result of the evaluation... is not valid. It is of type 'Null'"
- El Switch no recibe el campo `action`
- Verificar que el JSON Schema incluya `action`
- Usar `@triggerBody()['action']` en el Switch

### El contador no se actualiza
- Verificar que el estado en SharePoint sea "Conteo"
- Revisar que `field_3` tenga un timestamp válido
- Verificar la consola del navegador (F12)

### El misil no cambia a "Lanzado" después de 60 minutos
- Implementar Flow programado para auto-actualización
- O esperar a que el usuario recargue la página

---

## ✅ Checklist de Implementación

- [ ] Actualizar campo `field_1` en SharePoint con 4 opciones: "Armado", "Conteo", "Lanzado", "Desactivado"
- [ ] Crear/actualizar Flow POST con Switch para "initiate" y "deactivate"
- [ ] Verificar que el Flow esté **activado**
- [ ] Actualizar `config.json` con los endpoints correctos
- [ ] Probar: Iniciar conteo → Ver timer → Desactivar ✅
- [ ] Probar: Iniciar conteo → Esperar 60 min → Ver "Lanzado" ✅
- [ ] Opcional: Crear Flow programado para auto-lanzamiento

---

**¡Sistema V2 con Cuenta Regresiva completo! 🚀⏳**
