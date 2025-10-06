# 📱 Características Móviles

## 🎯 Optimizado 100% para Celulares

Este sistema está diseñado **exclusivamente para dispositivos móviles** con las siguientes características:

## 🌍 Animación GPS Espectacular

### Al Escanear el QR

1. **Pantalla de Localización**: Aparece un mapa táctico estilo HUD militar con mapa real de fondo
2. **Coordenadas del Evento**: Se muestra la ubicación fija del evento (Rosario, Argentina)
3. **Obtención GPS del Jugador**: El sistema solicita la ubicación del dispositivo
4. **Visualización en Tiempo Real**: 
   - Mapa real de OpenStreetMap de fondo (40% opacidad)
   - Cuadrícula táctica superpuesta
   - Círculos concéntricos animados
   - Líneas de radar giratorias
   - Retícula central pulsante en el objetivo
   - Coordenadas del evento: **-32.8311426, -60.7055789**

5. **Cálculo de Distancia**: Muestra distancia del jugador al objetivo en metros
6. **Animación de Zoom**: 
   - El mapa hace zoom espectacular hacia el punto objetivo
   - Efecto cinematográfico de 3 segundos
   - Transición suave al mini-juego

### Información GPS Capturada

```json
{
  "location": {
    "lat": -32.8311426,     // Ubicación del jugador (GPS)
    "lng": -60.7055789,     // O coordenadas del evento si GPS falla
    "accuracy": 10          // Precisión en metros
  }
}
```

- **Coordenadas del Evento**: Fijas en el código (-32.8311426, -60.7055789)
- **Ubicación del Jugador**: Obtenida por GPS (opcional)
- **Distancia calculada**: Entre jugador y objetivo
- **Precisión**: En metros (típicamente 5-50m)
- **Enviado al servidor**: Junto con los datos de captura

## 🎮 Optimizaciones Táctiles

### Áreas de Toque Grandes
- **Pines del juego**: 60x60px en desktop, 55x55px en móvil
- **Mínimo 44x44px**: Según guías de accesibilidad
- **Espaciado generoso**: Para evitar toques accidentales
- **Touch-action optimizado**: Respuesta táctil inmediata

### Botones Mejorados
- **Botones de bando**: 80px de altura mínima
- **Área táctil extendida**: Padding generoso
- **Feedback táctil**: Vibración al tocar (si el dispositivo lo soporta)
- **Sin zoom accidental**: `user-scalable=no`

### Controles
- **Drag & Drop táctil**: Optimizado para dedos
- **Alternativa por clic**: Clic-clic para conectar
- **Sin scroll horizontal**: Contenido ajustado
- **Sin rebote iOS**: `overscroll-behavior: none`

## 🎨 Diseño Visual Móvil

### Mapa Táctico
- **Canvas adaptativo**: Se ajusta a cualquier tamaño de pantalla
- **Renderizado en tiempo real**: Animaciones suaves
- **Estilo HUD militar**:
  - Fondo oscuro (#0a1e2a)
  - Cuadrícula verde fluorescente
  - Líneas diagonales de profundidad
  - Círculos concéntricos dorados
  - Punto central pulsante

### Retícula de Objetivo
- **Crosshair animado**: Pulsa cada 2 segundos
- **Líneas cruzadas**: Estilo francotirador
- **Glow effect**: Resplandor verde
- **Posición central**: Siempre centrada

### Información GPS
- **Overlay inferior**: Gradiente oscuro
- **Texto grande**: Legible a plena luz solar
- **Coordenadas monospace**: Estilo militar
- **Status en tiempo real**: "Localizando...", "Confirmado", etc.

## 📏 Responsive Design

### Viewport Optimizado
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### Breakpoints
- **Mobile First**: Diseñado primero para móvil
- **< 600px**: Optimizaciones adicionales
- **Portrait**: Orientación vertical prioritaria
- **Safe areas**: Respeta notch de iPhone

### Tipografía
- **Fuentes del sistema**: Carga instantánea
- **Tamaños escalables**: `clamp()` para adaptación fluida
- **Alto contraste**: Legible bajo sol
- **Text-shadow**: Mayor legibilidad

## ⚡ Performance Móvil

### Optimizaciones de Red
- **Tamaño mínimo**: ~70KB total (sin imágenes)
- **Sin CDNs externos**: Carga offline una vez descargado
- **Assets inline**: SVGs integrados en HTML
- **Caché agresivo**: PWA con Service Worker (opcional)

### Optimizaciones Gráficas
- **Canvas 2D**: Nativo, sin WebGL
- **CSS animations**: Aceleradas por GPU
- **Transform over position**: Para animaciones suaves
- **Will-change hints**: Para transiciones complejas

### Batería
- **Geolocalización puntual**: Solo al inicio
- **Animaciones pausadas**: Cuando no están visibles
- **Timers eficientes**: `requestAnimationFrame` cuando aplica

## 🔒 Permisos Móviles

### Geolocalización
```javascript
navigator.geolocation.getCurrentPosition(
    successCallback,
    errorCallback,
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
);
```

- **High accuracy**: GPS preciso, no solo WiFi/Cell
- **Timeout 10s**: Si demora, continúa sin GPS
- **No caché**: Ubicación fresca

### Vibración
```javascript
navigator.vibrate([30]); // Al conectar cables
navigator.vibrate([50, 50, 50]); // Al error
```

- **Feedback háptico**: Mejora la experiencia
- **Patrones diferentes**: Para éxito vs error
- **Opcional**: Funciona sin vibración si no está disponible

## 🎭 Estados de la Pantalla

### 1. Animación GPS (3-5 segundos)
- Mapa táctico de fondo
- Obteniendo ubicación
- Mostrando coordenadas
- Zoom espectacular

### 2. Mini-juego (10-30 segundos)
- Conectar cables
- Feedback visual/táctil
- Contador de progreso

### 3. Éxito (3 segundos)
- Animación "BASE CAPTURADA"
- Envío de datos
- Barra de progreso

### 4. Cooldown (30 minutos)
- Contador regresivo
- Icono de reloj
- Botón para volver

## 🧪 Testing en Móvil

### Dispositivos Probados
- ✅ **iPhone 12+**: Safari, Chrome
- ✅ **Android 9+**: Chrome, Samsung Internet
- ✅ **Tablets**: iPad, Android tablets

### Cómo Probar
1. **Desktop primero**: Abre DevTools → Device Mode
2. **Emular GPS**: DevTools → Sensors → Location
3. **Red 4G**: DevTools → Network → Slow 4G
4. **Dispositivo real**: Servidor HTTPS requerido para GPS

### Errores Comunes
- **GPS no funciona en HTTP**: Usar HTTPS o localhost
- **Permisos bloqueados**: Revisar configuración del navegador
- **Cooldown muy largo**: Borrar localStorage para testing

## 📍 Validación de Ubicación (Backend)

### Verificar Distancia
```javascript
// Comprobar que el jugador esté cerca de la base
const distance = calculateDistance(
    userLat, userLng,
    baseLat, baseLng
);

if (distance > 50) { // 50 metros
    return { error: 'Debes estar en la base para capturar' };
}
```

### Anti-Spoofing Básico
- Verificar `accuracy` < 50m
- Comparar con capturas anteriores del mismo dispositivo
- Rate limiting por ubicación geográfica
- Validar timestamp vs ubicación (velocidad imposible)

## 🎨 Personalización del Mapa

### Cambiar Colores
En `app.js`, función `drawTacticalMap()`:
```javascript
// Cuadrícula
ctx.strokeStyle = 'rgba(27, 190, 132, 0.15)'; // Verde India

// Círculos
ctx.strokeStyle = 'rgba(232, 197, 71, 0.2)'; // Dorado

// Punto central
ctx.fillStyle = 'rgba(232, 197, 71, 0.6)'; // Dorado brillante
```

### Cambiar Animación
En `styles.css`, `@keyframes mapZoom`:
```css
@keyframes mapZoom {
    0% {
        transform: scale(0.1);  /* Inicio: muy pequeño */
    }
    100% {
        transform: scale(20);   /* Final: muy grande */
    }
}
```

### Duración del Zoom
En `app.js`, función `animateMapZoom()`:
```javascript
setTimeout(() => {
    // ...
}, 3000); // Cambiar 3000 (3 segundos) por el valor deseado
```

## 🚀 Próximas Mejoras Opcionales

- [ ] **Mapa real**: Integrar con Leaflet o Mapbox
- [ ] **Múltiples bases**: Mostrar otras bases en el mapa
- [ ] **Ruta óptima**: Calcular distancia a bases cercanas
- [ ] **Brújula**: Indicar dirección a la base
- [ ] **Realidad aumentada**: Overlay de cámara
- [ ] **Modo offline**: Mapa descargable
- [ ] **Historial GPS**: Track de movimiento del jugador

---

**Diseñado para Móviles** 📱 | **GPS Integrado** 📍 | **Performance Optimizado** ⚡
