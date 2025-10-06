# 🧪 Guía Rápida de Testing

## ✅ Fix Aplicado

**Problema resuelto:** La animación GPS ya no se muestra después de capturar una base cuando el cooldown está activo.

**Lógica actualizada:**
```
Al cargar página con ?team=X
  ↓
¿Está en cooldown?
  ├─ SÍ → Ir directo a pantalla de cooldown (sin animación GPS)
  └─ NO → Mostrar animación GPS → Juego → Captura
```

---

## 🚀 Cómo Probar el Sistema

### 1. Iniciar Servidor Local

```powershell
npx http-server -p 8080 -c-1 --cors
```

**URLs disponibles:**
- Local: http://localhost:8080
- Red local: http://192.168.0.169:8080
- Hamachi: http://25.50.97.208:8080

---

### 2. Herramientas de Testing

#### 📊 Diagnóstico Completo
```
http://localhost:8080/diagnostico.html
```

**Qué hace:**
- ✅ Verifica config.json
- ✅ Valida archivos críticos
- ✅ Testea conectividad a Power Automate
- ✅ Prueba GPS, LocalStorage, Device ID
- ✅ Tests de integración
- ✅ Stress testing

**Botones importantes:**
- `▶️ Ejecutar Todos los Tests` - Diagnóstico automático completo
- `🧪 Test Power Automate` - Envía una captura real al endpoint
- `📍 Test GPS` - Solicita ubicación real del navegador
- `🇮🇳 Captura India Completa` - Test de integración

#### 🧪 Testing Manual de Capturas
```
http://localhost:8080/test-capture.html
```

**Qué hace:**
- Test individual de capturas India/Pakistan
- Simulación de GPS
- Test de escenarios de cooldown
- Respuestas en tiempo real

---

### 3. Flujo de Testing Completo

#### A. Test Local Básico

1. **Abrir app:**
   ```
   http://localhost:8080/?team=india
   ```

2. **Verificar flujo:**
   - ✅ Animación GPS se muestra
   - ✅ Coordenadas del evento (-32.83114, -60.70558)
   - ✅ Mensaje "OBJETIVO LOCALIZADO"
   - ✅ Zoom al mapa
   - ✅ Mini-juego aparece
   - ✅ Conectar 3 cables correctamente
   - ✅ "BASE CAPTURADA" se muestra
   - ✅ Página se recarga automáticamente

3. **Verificar cooldown (NUEVO FIX):**
   - ✅ Después de recarga, NO se muestra animación GPS
   - ✅ Va directo a pantalla de cooldown
   - ✅ Contador muestra 30:00 y va bajando
   - ✅ LocalStorage tiene `captureCooldown:india`

#### B. Test de Cooldown

```javascript
// En consola del navegador (F12):

// Ver cooldown actual
localStorage.getItem('captureCooldown:india')

// Simular cooldown expirado (hace 31 minutos)
localStorage.setItem('captureCooldown:india', Date.now() - (31 * 60 * 1000))

// Limpiar cooldown para volver a jugar
localStorage.removeItem('captureCooldown:india')
localStorage.removeItem('captureCooldown:pakistan')

// Ver Device ID
localStorage.getItem('deviceId')
```

#### C. Test de Captura Real a Power Automate

1. **Abrir diagnóstico:**
   ```
   http://localhost:8080/diagnostico.html
   ```

2. **Ejecutar "🧪 Test Power Automate"**

3. **Ver logs en consola:**
   - Verde = Éxito (HTTP 200)
   - Naranja = Cooldown (HTTP 429)
   - Rojo = Error

4. **Verificar en SharePoint:**
   - Ir a lista "Capturas Airsoft"
   - Buscar el elemento con el `deviceId` usado
   - Verificar que los campos estén llenos:
     - Equipo = India/Pakistan
     - DeviceID = xxx-xxx-xxx
     - Timestamp = fecha/hora
     - Estado = Activa

---

### 4. Escenarios de Prueba

#### Escenario 1: Primera Captura ✅
```
1. Limpiar cooldown en LocalStorage
2. Abrir http://localhost:8080/?team=india
3. Esperar: Animación GPS completa
4. Jugar mini-juego
5. Ver "BASE CAPTURADA"
6. Verificar: Aparece en SharePoint
```

#### Escenario 2: Captura con Cooldown Activo ✅ (FIX NUEVO)
```
1. Capturar una base (Escenario 1)
2. Recargar la página (F5)
3. Verificar: NO se muestra animación GPS
4. Verificar: Va directo a pantalla cooldown
5. Ver contador: 29:XX (aproximadamente)
```

#### Escenario 3: Captura Después de Cooldown Expirado ✅
```
1. En consola, simular cooldown expirado:
   localStorage.setItem('captureCooldown:india', Date.now() - (31 * 60 * 1000))
2. Recargar página
3. Verificar: Animación GPS se muestra (cooldown expiró)
4. Jugar mini-juego
5. Capturar nuevamente
```

#### Escenario 4: Dispositivo Diferente ✅
```
1. Limpiar todo LocalStorage
2. Abrir en modo incógnito / otro navegador
3. Device ID será diferente
4. Puede capturar aunque otro dispositivo esté en cooldown
```

#### Escenario 5: Equipo Diferente ✅
```
1. Capturar con India
2. Inmediatamente ir a ?team=pakistan
3. Verificar: Puede capturar (cooldown por equipo+dispositivo)
```

---

### 5. Verificación en Power Automate

1. **Abrir Flow:**
   ```
   https://make.powerautomate.com
   ```

2. **Buscar "API Captura Airsoft"**

3. **Ver historial de ejecuciones:**
   - Verde = Éxito (captura guardada)
   - Rojo = Error (revisar detalles)

4. **Verificar acción "UltimaCaptura":**
   - Debe mostrar `field_3` con timestamp
   - Si muestra `null`, revisar tabla de mapeo SharePoint

5. **Verificar acción "MinutosTranscurridos":**
   - Si primera captura: 999999
   - Si segunda captura: Número real de minutos

---

### 6. Testing en Móvil Real

#### A. Conectar en misma red WiFi

1. **Obtener IP de PC:**
   ```powershell
   ipconfig
   # Buscar IPv4 de WiFi (ej: 192.168.0.169)
   ```

2. **En móvil, abrir:**
   ```
   http://192.168.0.169:8080/?team=india
   ```

#### B. Testing GPS Real

1. Abrir en móvil
2. Permitir acceso a ubicación
3. Verificar que muestra:
   - Coordenadas GPS reales
   - Distancia al evento
   - Precisión en metros

#### C. Testing Táctil

1. Probar mini-juego con touch
2. Verificar que pins son clicables
3. Probar rotación de pantalla
4. Verificar que conexiones se redibujan

---

### 7. Problemas Comunes y Soluciones

#### ❌ "Animación GPS se sigue mostrando después de captura"
**Causa:** El fix no se aplicó correctamente  
**Solución:** 
```powershell
git pull origin main
# Verificar que app.js tiene la verificación de cooldown
```

#### ❌ "Power Automate no recibe datos"
**Causa:** URL incorrecta o expirada  
**Solución:**
```powershell
cat config.json
# Verificar que apiUrl está correcta
# Regenerar URL en Power Automate si es necesario
```

#### ❌ "Cooldown no funciona"
**Causa:** LocalStorage deshabilitado o limpiado  
**Solución:**
```javascript
// En consola, verificar:
localStorage.getItem('captureCooldown:india')
// Si es null, el cooldown no existe
```

#### ❌ "SharePoint no guarda datos"
**Causa:** Field names incorrectos en Power Automate  
**Solución:**
- Usar `field_1`, `field_2`, `field_3` en "Get items"
- Usar `Equipo`, `DeviceID`, `Timestamp` en "Create item"

---

### 8. Checklist Final

Antes del evento, verificar:

- [ ] Servidor local funciona (8080)
- [ ] Config.json tiene URL correcta de Power Automate
- [ ] Power Automate Flow está activo
- [ ] SharePoint List existe con columnas correctas
- [ ] Test de captura exitoso en SharePoint
- [ ] Test de cooldown funciona correctamente
- [ ] Test en móvil funciona con WiFi
- [ ] GPS se obtiene correctamente
- [ ] Mini-juego funciona en touch
- [ ] Animación GPS NO se repite después de captura ✅ NUEVO
- [ ] Pantalla de cooldown muestra tiempo restante
- [ ] Diseño responsive funciona en móvil

---

### 9. URLs de Referencia Rápida

```
# Diagnóstico completo
http://localhost:8080/diagnostico.html

# Test manual de capturas
http://localhost:8080/test-capture.html

# App India
http://localhost:8080/?team=india

# App Pakistan
http://localhost:8080/?team=pakistan

# Selector de equipo
http://localhost:8080/

# Power Automate
https://make.powerautomate.com

# SharePoint (actualiza con tu URL)
https://tuempresa.sharepoint.com/sites/airsoft/Lists/Capturas%20Airsoft
```

---

### 10. Comandos de Consola Útiles

```javascript
// Ver configuración cargada
console.log(CONFIG)

// Ver device ID actual
console.log(deviceId)

// Ver equipo actual
console.log(currentTeam)

// Ver ubicación GPS capturada
console.log(userLocation)

// Calcular distancia manualmente
calculateDistance(-32.8311426, -60.7055789, -32.8311426, -60.7055789)

// Ver eventos pendientes de envío
JSON.parse(localStorage.getItem('pendingEvents'))

// Limpiar todo y empezar de cero
localStorage.clear()
location.reload()

// Simular captura hace X minutos
const minutosAtras = 15;
localStorage.setItem('captureCooldown:india', Date.now() - (minutosAtras * 60 * 1000))
```

---

## 🎯 Cambios Recientes (Commit fe29c30)

### ✅ Fix Principal: Animación GPS después de captura

**Antes:**
```
Captura → Recarga → Animación GPS completa → Cooldown
❌ Muestra animación innecesaria
```

**Ahora:**
```
Captura → Recarga → Directo a Cooldown
✅ Salta animación si cooldown activo
```

**Código modificado:**
```javascript
// En DOMContentLoaded:
const cooldown = isOnCooldown(team);
if (cooldown.active) {
    // Saltar directamente al juego (mostrará cooldown)
    document.body.className = `theme-${team}`;
    initGame(team);
} else {
    // Mostrar animación GPS normal
    showGPSAnimation(team);
}
```

---

## 📝 Notas Importantes

1. **El cooldown es por equipo + dispositivo:** Cada Device ID puede capturar una vez cada 30 minutos por equipo.

2. **LocalStorage persiste:** Aunque cierres el navegador, el cooldown se mantiene.

3. **Modo incógnito = Device ID nuevo:** Cada ventana incógnita genera un Device ID diferente.

4. **Power Automate valida en servidor:** Aunque limpies LocalStorage, Power Automate sigue validando el cooldown en SharePoint.

5. **La animación GPS solo se ve la primera vez:** Después de capturar, solo verás el cooldown hasta que expiren los 30 minutos.

---

**Última actualización:** 6 de octubre de 2025 - Commit fe29c30  
**Fix aplicado:** Saltar animación GPS si cooldown está activo ✅
