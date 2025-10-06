# 📍 Configuración de Ubicación del Evento

## 🗺️ Ubicación Actual

**Rosario, Argentina**
- **Latitud**: -32.8311426
- **Longitud**: -60.7055789
- **Zoom**: 17 (nivel de detalle del mapa)
- **Vista**: [Google Maps](https://www.google.com/maps/@-32.8311426,-60.7055789,1084m/data=!3m1!1e3)

## 🔧 Cómo Cambiar la Ubicación

### Paso 1: Obtener Coordenadas

1. Abre [Google Maps](https://maps.google.com)
2. Navega hasta la ubicación del evento
3. **Click derecho** en el punto exacto
4. Click en las **coordenadas** que aparecen en el menú
5. Las coordenadas se copian automáticamente (formato: `-32.8311426, -60.7055789`)

### Paso 2: Editar el Código

Abre el archivo `app.js` y busca esta sección al inicio:

```javascript
// Coordenadas fijas del evento (Rosario, Argentina)
const EVENT_LOCATION = {
    lat: -32.8311426,
    lng: -60.7055789,
    zoom: 17
};
```

Reemplaza con tus coordenadas:

```javascript
// Coordenadas fijas del evento (Tu Ciudad, País)
const EVENT_LOCATION = {
    lat: TU_LATITUD,      // Ejemplo: -34.603722
    lng: TU_LONGITUD,     // Ejemplo: -58.381592
    zoom: 17              // 15-18 recomendado para Airsoft
};
```

### Paso 3: Ajustar Nivel de Zoom

El valor de `zoom` controla qué tan cerca se ve el mapa:

- **15**: Vista amplia del vecindario
- **16**: Vista de varias manzanas
- **17**: Vista detallada (RECOMENDADO para Airsoft)
- **18**: Vista muy cercana
- **19**: Máximo detalle

## 🎯 Ejemplos de Ubicaciones

### Buenos Aires, Argentina
```javascript
const EVENT_LOCATION = {
    lat: -34.603722,
    lng: -58.381592,
    zoom: 17
};
```

### Ciudad de México, México
```javascript
const EVENT_LOCATION = {
    lat: 19.432608,
    lng: -99.133209,
    zoom: 17
};
```

### Bogotá, Colombia
```javascript
const EVENT_LOCATION = {
    lat: 4.710989,
    lng: -74.072092,
    zoom: 17
};
```

### Madrid, España
```javascript
const EVENT_LOCATION = {
    lat: 40.416775,
    lng: -3.703790,
    zoom: 17
};
```

## 🗺️ Tipos de Mapa Disponibles

### OpenStreetMap (Actual)
- **URL**: `tile.openstreetmap.org`
- **Ventajas**: Gratuito, sin límites, sin API key
- **Estilo**: Mapa de calles detallado
- **Costo**: $0

### Alternativas (Requieren API Key)

#### Mapbox Satellite
```javascript
// En función loadMapBackground(), reemplaza:
const tileUrl = `https://api.mapbox.com/v4/mapbox.satellite/${zoom}/${x}/${y}.png?access_token=TU_API_KEY`;
```
- **Estilo**: Vista satelital
- **Costo**: 200,000 tiles/mes gratis

#### Google Maps
Requiere implementación más compleja con API de Google Maps.

## 🧪 Verificar Coordenadas

Después de cambiar las coordenadas:

1. **Guarda el archivo** `app.js`
2. **Recarga la página** con `?team=india` o `?team=pakistan`
3. **Verifica** que las coordenadas mostradas sean correctas
4. **Confirma** que el mapa muestra la ubicación deseada

## 🔍 Validación de Distancia

El sistema calcula la distancia entre:
- **Jugador**: Ubicación GPS del dispositivo móvil
- **Objetivo**: Las coordenadas configuradas en `EVENT_LOCATION`

Esta información se muestra durante la animación:
```
Distancia: 150m | ±10m
```

### En el Backend

Puedes usar esta distancia para validar que el jugador esté realmente en el evento:

```javascript
// Ejemplo en Node.js
if (data.distance > 100) { // 100 metros máximo
    return res.status(400).json({ 
        error: 'Debes estar en la ubicación del evento para capturar' 
    });
}
```

## 📱 Mapa en Dispositivos Móviles

### Consideraciones

1. **HTTPS Requerido**: Los navegadores modernos solo permiten GPS en sitios seguros
2. **Permisos**: El usuario debe aceptar compartir su ubicación
3. **Precisión**: 
   - Con GPS activado: 5-20 metros
   - Solo WiFi/Cell: 20-100 metros
   - Sin señal: No disponible

### Optimización de Carga

Los tiles del mapa se cargan bajo demanda:
- **Tamaño por tile**: ~15-30 KB
- **Total (3x3 grid)**: ~150-300 KB
- **Tiempo de carga**: 1-3 segundos en 4G
- **Caché**: Los navegadores cachean automáticamente

### Fallback

Si el mapa real no carga (sin conexión, bloqueado, etc.):
- Se muestra solo el **mapa táctico** generado por Canvas
- La animación continúa normalmente
- No afecta la funcionalidad del juego

## 🎨 Personalización Visual

### Cambiar Opacidad del Mapa Real

En `app.js`, función `loadMapBackground()`:
```javascript
ctx.globalAlpha = 0.4; // 0.0 = invisible, 1.0 = opaco
```

Valores recomendados:
- `0.3`: Mapa muy transparente, más énfasis en overlay táctico
- `0.4`: Balanceado (ACTUAL)
- `0.5`: Mapa más visible
- `0.6`: Mapa predominante

### Desactivar Mapa Real

Para usar solo el overlay táctico sin mapa de fondo:

En `app.js`, función `initMapCanvas()`:
```javascript
function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Comentar esta línea para desactivar mapa real:
    // loadMapBackground(ctx, canvas.width, canvas.height);
    
    // Usar solo overlay táctico:
    drawTacticalMap(ctx, canvas.width, canvas.height);
    drawTacticalOverlay(ctx, canvas.width, canvas.height);
}
```

---

**💡 Tip**: Prueba diferentes niveles de zoom y opacidades hasta encontrar el equilibrio visual perfecto para tu evento.
