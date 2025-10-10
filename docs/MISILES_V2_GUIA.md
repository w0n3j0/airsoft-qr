# 🚀 Sistema de Misiles V2 - Guía Rápida

## 🎯 ¿Qué hay de nuevo?

Cada misil ahora tiene **2 QR codes** y **3 estados posibles**:

### Estados:
- 🔴 **ARMADO** - Estado inicial
- 🚀 **LANZADO** - Misil en vuelo (QR naranja escaneado)
- 🟢 **DESACTIVADO** - Misil neutralizado (QR verde escaneado)

### 2 QR Codes por Misil:

#### QR Naranja 🚀 - LANZAR
- URL: `lanzar-misil.html?missile=X`
- **Acción**: Lanza el misil
- **Uso**: Equipo atacante escanea para activar el misil
- **Efecto**: El misil pasa de ARMADO → LANZADO

#### QR Verde 🟢 - DESACTIVAR
- URL: `misil.html?missile=X`
- **Acción**: Desactiva el misil
- **Uso**: Equipo defensor escanea para neutralizarlo
- **Efecto**: El misil pasa a DESACTIVADO (desde cualquier estado)

---

## 🎮 Mecánica de Juego

### Escenario 1: Misil Armado
- Estado inicial: 🔴 **ARMADO**
- Equipo A escanea QR naranja → 🚀 **LANZADO**
- Equipo B puede escanear QR verde → 🟢 **DESACTIVADO**

### Escenario 2: Misil Ya Lanzado
- Equipo A ya lanzó el misil: 🚀 **LANZADO**
- Equipo B escanea QR verde → 🟢 **DESACTIVADO** ✅
- Equipo A intenta relanzar → ❌ **ERROR** (ya lanzado)

### Escenario 3: Misil Desactivado
- Estado: 🟢 **DESACTIVADO**
- Cualquier equipo intenta lanzar → ❌ **ERROR** (desactivado)
- Cualquier equipo intenta desactivar → ❌ **ERROR** (ya desactivado)

---

## 📊 Reglas de Transición

| Estado Actual | Lanzar (QR 🚀) | Desactivar (QR 🟢) |
|---------------|----------------|---------------------|
| 🔴 Armado     | ✅ → Lanzado   | ✅ → Desactivado   |
| 🚀 Lanzado    | ❌ Error       | ✅ → Desactivado   |
| 🟢 Desactivado| ❌ Error       | ❌ Error           |

### Regla de Oro:
**Un misil DESACTIVADO no puede ser lanzado ni relanzado** 🔒

---

## 🖨️ Impresión de QR Codes

### Misil 1

**QR Lanzamiento (Naranja 🚀):**
```
https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=1
```

**QR Desactivación (Verde 🟢):**
```
https://w0n3j0.github.io/airsoft-qr/misil.html?missile=1
```

### Misil 2

**QR Lanzamiento (Naranja 🚀):**
```
https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=2
```

**QR Desactivación (Verde 🟢):**
```
https://w0n3j0.github.io/airsoft-qr/misil.html?missile=2
```

### Misil 3

**QR Lanzamiento (Naranja 🚀):**
```
https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=3
```

**QR Desactivación (Verde 🟢):**
```
https://w0n3j0.github.io/airsoft-qr/misil.html?missile=3
```

---

## 🎨 Recomendaciones de Diseño

### QR de Lanzamiento (Naranja)
- Fondo: Naranja/Amarillo
- Texto: "🚀 LANZAR MISIL X"
- Marco: Grueso, color naranja
- Tamaño: 10x10 cm mínimo

### QR de Desactivación (Verde)
- Fondo: Verde
- Texto: "🟢 DESACTIVAR MISIL X"
- Marco: Grueso, color verde
- Tamaño: 10x10 cm mínimo

### Colocación Recomendada:
1. **QR Naranja**: Cerca del equipo atacante o en zona neutral
2. **QR Verde**: Cerca del misil o zona a defender

---

## 📱 Experiencia de Usuario

### Al Escanear QR Lanzamiento:
1. Pantalla con animación de misil flotante
2. Botón grande: **"🚀 LANZAR MISIL"**
3. Al presionar:
   - Vibración del dispositivo
   - Explosión de partículas animadas
   - Pantalla de éxito: "¡MISIL LANZADO!"
   - Timestamp del lanzamiento

### Al Escanear QR Desactivación:
1. Pantalla con alerta roja pulsante
2. Botón grande: **"⚡ DESACTIVAR AHORA"**
3. Al presionar:
   - Vibración del dispositivo
   - Cambio a pantalla verde
   - Mensaje: "MISIL DESACTIVADO"
   - Timestamp de desactivación

---

## 📊 Dashboard de Métricas

Visualización en tiempo real:

```
🚀 Estado de Misiles
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MISIL 1    │  │   MISIL 2    │  │   MISIL 3    │
│      🚀      │  │      🟢      │  │      🔴      │
│   LANZADO    │  │ DESACTIVADO  │  │    ARMADO    │
│  10:30:15    │  │  09:15:42    │  │      -       │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🧪 Testing Local

### Paso 1: Iniciar servidor
```bash
http-server -p 8080 -c-1 --cors
```

### Paso 2: Probar URLs

**Lanzamiento Misil 1:**
```
http://127.0.0.1:8080/lanzar-misil.html?missile=1
```

**Desactivación Misil 1:**
```
http://127.0.0.1:8080/misil.html?missile=1
```

**Métricas:**
```
http://127.0.0.1:8080/metrics.html
```

---

## ⚙️ Configuración Backend

### Actualizar `config.json`:

```json
{
  "missileApiUrl": "URL_PARA_DESACTIVAR",
  "missileLaunchUrl": "URL_PARA_LANZAR",
  "missileMetricsUrl": "URL_PARA_CONSULTAR"
}
```

**Nota**: Si usas el mismo flow para ambas acciones, `missileLaunchUrl` puede ser igual a `missileApiUrl`. El sistema diferencia por el campo `action` en el payload.

---

## 🎯 Estrategias de Juego

### Para el Equipo Atacante:
1. Buscar QR naranja de lanzamiento
2. Escanear rápidamente antes que el defensor
3. Si ya fue desactivado, buscar otro misil

### Para el Equipo Defensor:
1. Proteger las ubicaciones de los QR verdes
2. Desactivar misiles antes que sean lanzados
3. Si un misil fue lanzado, aún puede desactivarse

### Puntuación Sugerida:
- 🚀 **Misil Lanzado**: +50 puntos atacante
- 🟢 **Misil Desactivado**: +30 puntos defensor
- 🎯 **Desactivar después de lanzado**: +50 puntos defensor (heroico)

---

## 🚨 Solución de Problemas

### Error: "Este misil ya fue desactivado"
- **Causa**: El QR verde ya fue escaneado
- **Solución**: Buscar otro misil disponible

### Error: "Este misil ya fue lanzado"
- **Causa**: Intentando relanzar un misil
- **Solución**: Cada misil solo puede lanzarse una vez

### No se actualiza el estado en métricas
- **Solución**: Presionar botón "🔄 Actualizar Datos"
- Verificar conexión a internet
- Verificar que el backend está configurado

---

## 📞 Soporte

Ver documentación técnica completa en:
- `MISILES_BACKEND_V2.md` - Configuración Power Automate
- `README.md` - Documentación general del sistema

---

¡Que gane el mejor equipo! 🎮🚀🟢
