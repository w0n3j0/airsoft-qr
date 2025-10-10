# 📍 VALIDACIÓN DE DISTANCIA AL HQ

**Fecha:** 6 de octubre de 2025  
**Funcionalidad:** Sistema de confianza basado en proximidad al HQ

---

## 🎯 ¿Qué se Agregó?

Un sistema de validación que **calcula y registra la distancia** entre la ubicación GPS del jugador y el HQ (cuartel general) de su equipo al momento de capturar la base.

### Objetivo:
✅ **Verificar que el QR se escanee físicamente en la ubicación correcta**  
✅ **Detectar capturas fraudulentas** (escaneadas lejos del HQ)  
✅ **Generar métricas de confianza** para análisis post-evento

---

## 📍 Coordenadas de los HQ

```javascript
HQ India:    -32.83175, -60.70847
HQ Pakistán: -32.83208, -60.70394
```

### Radio de Validación:
- **100 metros** = Distancia máxima permitida para captura válida
- Capturas fuera de este radio se marcan como **sospechosas** en las métricas

---

## 🔧 Cambios Técnicos

### 1. app.js - Cálculo Automático

**Nuevo código en `sendCapture()`:**
```javascript
// Calcular distancia al HQ del equipo
let distanceToHQ = null;
let hqValidation = null;

if (userLocation && HQ_LOCATIONS[currentTeam]) {
    const hq = HQ_LOCATIONS[currentTeam];
    distanceToHQ = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        hq.lat, 
        hq.lng
    );
    
    hqValidation = {
        distanceMeters: Math.round(distanceToHQ),
        isValid: distanceToHQ <= HQ_VALIDATION_RADIUS,
        hqName: hq.name,
        maxRadius: HQ_VALIDATION_RADIUS
    };
    
    console.log(`📍 Distancia al ${hq.name}: ${Math.round(distanceToHQ)}m`);
}
```

**Nuevo campo en payload:**
```javascript
{
    team: "India",
    ts: "2025-10-06T23:45:00Z",
    deviceId: "abc123...",
    location: {
        lat: -32.83180,
        lng: -60.70850,
        accuracy: 15
    },
    hqValidation: {                    // ← NUEVO
        distanceMeters: 45,            // Distancia en metros
        isValid: true,                  // Si está dentro del radio
        hqName: "HQ Indio",
        maxRadius: 100
    }
}
```

### 2. SharePoint - Nueva Columna

**Agregar en la lista de SharePoint:**
```
Nombre: DistanciaHQ
Nombre Interno: field_8
Tipo: Number
Decimales: 0
Descripción: Distancia al HQ del equipo en metros
```

### 3. Power Automate - Mapeo

**Actualizar el paso "Create item":**
```
DistanciaHQ: @{triggerBody()?['hqValidation']?['distanceMeters']}
```

### 4. metrics.html - Visualización

**Nueva columna en tabla:**
```html
<th>Dist. HQ</th>
```

**Nueva función para badges de confianza:**
```javascript
function getHQDistanceBadge(distance) {
    if (distance <= 100) return `${distance}m ✓`;     // Verde - Válido
    if (distance <= 200) return `${distance}m`;       // Amarillo - Sospechoso
    if (distance <= 500) return `${distance}m ⚠️`;    // Naranja - Dudoso
    return `${distance}m ✗`;                          // Rojo - Inválido
}
```

---

## 🎨 Indicadores Visuales en Métricas

### Badges de Confianza:

| Distancia | Color | Símbolo | Significado |
|-----------|-------|---------|-------------|
| ≤ 100m    | 🟢 Verde | ✓ | **Válido** - Dentro del HQ |
| 101-200m  | 🟡 Amarillo | - | **Sospechoso** - Cerca pero fuera |
| 201-500m  | 🟠 Naranja | ⚠️ | **Dudoso** - Lejos del HQ |
| > 500m    | 🔴 Rojo | ✗ | **Inválido** - Muy lejos |

---

## 📊 Ejemplo en Métricas

```
┌──┬────────┬───────────┬────────────┬──────────┬─────────┬────────┐
│# │Equipo  │Timestamp  │Device ID   │GPS       │Dist. HQ │Estado  │
├──┼────────┼───────────┼────────────┼──────────┼─────────┼────────┤
│1 │India   │Hace 2m    │abc123...   │15m 🟢    │45m ✓    │Activa  │
│2 │Pakistan│Hace 5m    │def456...   │12m 🟢    │320m ⚠️  │Activa  │
│3 │India   │Hace 12m   │ghi789...   │200m 🔴   │850m ✗   │Activa  │
└──┴────────┴───────────┴────────────┴──────────┴─────────┴────────┘
```

### Análisis:
- **Captura #1**: GPS bueno (15m) + HQ válido (45m) = ✅ **Confiable**
- **Captura #2**: GPS bueno (12m) + HQ dudoso (320m) = ⚠️ **Revisar**
- **Captura #3**: GPS malo (200m) + HQ inválido (850m) = ❌ **Sospechosa**

---

## 🔍 Casos de Uso

### 1. Detección de Fraude
```
Escenario: Jugador escanea QR desde su casa (3km del HQ)
Resultado: field_8 = 3000m (Rojo ✗)
Acción: Organizador invalida la captura
```

### 2. Validación Post-Evento
```
Escenario: Revisar todas las capturas con distancia > 100m
Query SharePoint: WHERE field_8 > 100
Resultado: Lista de capturas sospechosas para revisar
```

### 3. Estadísticas de Confianza
```
Total capturas: 50
Válidas (≤100m): 42 (84%)
Sospechosas (>100m): 8 (16%)
Inválidas (>500m): 2 (4%)
```

---

## 🧪 Cómo Probar

### 1. Captura Normal (cerca del HQ)
```bash
# Abre en navegador cerca del HQ India
http://localhost:8080/?team=india

# En consola deberías ver:
📍 Distancia al HQ Indio: 45m (VÁLIDO)
```

### 2. Captura de Prueba (lejos del HQ)
```bash
# Si estás lejos del HQ
📍 Distancia al HQ Indio: 1250m (FUERA DE RANGO)
```

### 3. Ver en Métricas
```bash
# Abrir página de métricas
http://localhost:8080/metrics.html

# Verificar columna "Dist. HQ"
# Capturas válidas: Verde con ✓
# Capturas sospechosas: Amarillo/Naranja/Rojo
```

---

## 📝 Documentación Actualizada

### Archivos Modificados:

1. ✅ **app.js**
   - Agregadas constantes `HQ_LOCATIONS` y `HQ_VALIDATION_RADIUS`
   - Función `sendCapture()` calcula distancia al HQ
   - Campo `hqValidation` en payload

2. ✅ **metrics.html**
   - Nueva columna "Dist. HQ" en tabla
   - Función `getHQDistanceBadge()` para badges
   - Renderizado de distancia con colores

3. ✅ **examples/README.md**
   - Documentado nuevo campo `hqValidation.distanceMeters`
   - Mapeo a columna SharePoint `DistanciaHQ` (field_8)

---

## ⚙️ Configuración de SharePoint

### Paso a Paso:

1. **Ir a la lista de SharePoint**
   ```
   Tu sitio → Listas → capturas_v2
   ```

2. **Agregar nueva columna**
   - Clic en "+ Add column"
   - Seleccionar "Number"
   - Nombre: `DistanciaHQ`
   - Decimales: `0`
   - Guardar

3. **Actualizar Power Automate**
   ```
   Editar Flow → Create item → Agregar campo dinámico:
   
   DistanciaHQ: triggerBody()?['hqValidation']?['distanceMeters']
   ```

4. **Probar**
   - Hacer una captura de prueba
   - Verificar que field_8 tenga un valor numérico

---

## 🎯 Beneficios

### Para Organizadores:
- ✅ **Detección automática** de capturas fraudulentas
- ✅ **Métricas de confianza** en tiempo real
- ✅ **Evidencia objetiva** para invalidar capturas
- ✅ **Análisis post-evento** más preciso

### Para el Evento:
- ✅ **Mayor integridad** del sistema de puntos
- ✅ **Transparencia** en validación de capturas
- ✅ **Prevención** de trampas
- ✅ **Confianza** de los participantes

---

## 🔐 Consideraciones de Seguridad

### ⚠️ Importante:

1. **GPS puede tener errores**
   - Precisión varía según dispositivo
   - Edificios/árboles afectan señal
   - Considerar margen de error

2. **No invalidar automáticamente**
   - Usar como indicador, no como regla absoluta
   - Revisar casos sospechosos manualmente
   - Considerar context (GPS malo en ciudad)

3. **Radio de 100m es configurable**
   ```javascript
   const HQ_VALIDATION_RADIUS = 100; // Ajustar según terreno
   ```

---

## 📊 Próximos Pasos

### Sugerencias Opcionales:

1. **Dashboard de Confianza**
   - Gráfico de pastel: Válidas vs Sospechosas
   - Top jugadores con más capturas válidas

2. **Alertas en Tiempo Real**
   - Notificación cuando captura > 200m
   - Email a organizadores con capturas dudosas

3. **Mapa de Calor**
   - Visualizar ubicaciones de capturas en mapa
   - Identificar patrones sospechosos

---

**Estado:** ✅ Implementado y listo para probar  
**Archivos modificados:** 3  
**Nuevos campos:** 1 (field_8: DistanciaHQ)  
**Testing:** http://localhost:8080/metrics.html

**¡Ahora tienes un sistema de validación geográfica completo!** 🎯📍
