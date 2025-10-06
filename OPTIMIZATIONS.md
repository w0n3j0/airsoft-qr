# 🚀 Optimización y Mejoras Opcionales

Este documento contiene sugerencias para mejorar el sitio si lo necesitas en el futuro.

## 📊 Performance Actual

El sitio actual está optimizado para ser ligero:
- ✅ HTML: ~4KB
- ✅ CSS: ~8KB  
- ✅ JavaScript: ~9KB
- ✅ **Total: ~21KB** (sin imágenes)
- ✅ Sin dependencias externas
- ✅ Carga instantánea en 4G

## 🎨 Mejoras Visuales Opcionales

### 1. Audio de Feedback

Añadir sonidos cortos (< 150ms) para mejor UX:

```javascript
// En app.js, después de la función vibrate()
const sounds = {
    click: new Audio('data:audio/wav;base64,...'), // Click corto
    success: new Audio('data:audio/wav;base64,...'), // Éxito
    error: new Audio('data:audio/wav;base64,...')  // Error
};

function playSound(type) {
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(() => {}); // Silenciar si falla
    }
}
```

Usar **data URIs** para evitar peticiones HTTP extra.

### 2. Partículas de Fondo

Añadir partículas sutiles con Canvas:

```javascript
// Crear canvas de fondo
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '0';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Partículas simples
const particles = Array.from({ length: 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1
}));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--theme-primary');
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.globalAlpha = 0.3;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    
    requestAnimationFrame(animate);
}

animate();
```

**Costo**: +2KB, puede afectar performance en móviles antiguos.

### 3. Modo Oscuro/Claro

Si lo necesitas (aunque el tema actual es ideal para el contexto):

```css
@media (prefers-color-scheme: light) {
    :root {
        --bg-dark: #F5F5F5;
        --bg-panel: #FFFFFF;
        --text-primary: #1A1A1A;
        /* ... */
    }
}
```

## 🔌 Service Worker (PWA Completa)

Para que funcione offline:

**sw.js**:
```javascript
const CACHE_NAME = 'airsoft-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

**Registrar en app.js**:
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registrado'))
        .catch(err => console.log('SW error:', err));
}
```

## 📡 WebSocket para Tiempo Real

Si quieres ver capturas en vivo en un dashboard:

**Frontend**:
```javascript
const ws = new WebSocket('wss://tu-servidor.com/ws');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Captura en vivo:', data);
    // Actualizar UI
};
```

**Backend (Node.js)**:
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('Cliente conectado');
});

// Cuando hay captura:
function broadcastCapture(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
```

## 🗺️ Geolocalización

Para verificar que están en la ubicación correcta:

```javascript
function verifyLocation(expectedLat, expectedLng, radiusMeters = 50) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const distance = calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    expectedLat,
                    expectedLng
                );
                
                if (distance <= radiusMeters) {
                    resolve(true);
                } else {
                    reject('Fuera del área de captura');
                }
            },
            error => reject(error.message)
        );
    });
}

// Fórmula Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}
```

## 📊 Analytics

Para estadísticas (sin violar privacidad):

```javascript
// Plausible (respetuoso con privacidad)
// Añadir en <head>:
<script defer data-domain="tu-dominio.com" src="https://plausible.io/js/plausible.js"></script>

// Trackear eventos:
function trackEvent(eventName, props) {
    if (window.plausible) {
        window.plausible(eventName, { props });
    }
}

// Uso:
trackEvent('Base Captured', { team: 'india' });
trackEvent('Game Started', { team: 'pakistan' });
```

## 🎮 Más Tipos de Mini-juegos

### Código Morse
```javascript
const morseGame = {
    code: '... --- ...',  // SOS
    input: '',
    check() {
        return this.input === this.code;
    }
};
```

### Simon Says
```javascript
const simonGame = {
    sequence: [],
    userSequence: [],
    colors: ['red', 'blue', 'green', 'yellow'],
    
    newRound() {
        const randomColor = this.colors[Math.floor(Math.random() * 4)];
        this.sequence.push(randomColor);
        this.showSequence();
    }
};
```

### Desactivación de Bomba (números)
```javascript
const bombGame = {
    code: [4, 2, 7, 1],
    input: [],
    defuse() {
        return JSON.stringify(this.input) === JSON.stringify(this.code);
    }
};
```

## 🔒 Seguridad Adicional

### Firmar Requests con HMAC

**Frontend**:
```javascript
async function signPayload(payload, secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
```

**Backend**:
```javascript
function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const expected = hmac.digest('base64');
    return signature === expected;
}
```

### Rate Limiting Cliente

```javascript
const rateLimiter = {
    attempts: [],
    maxAttempts: 5,
    windowMs: 60000, // 1 minuto
    
    canAttempt() {
        const now = Date.now();
        this.attempts = this.attempts.filter(t => now - t < this.windowMs);
        
        if (this.attempts.length >= this.maxAttempts) {
            return false;
        }
        
        this.attempts.push(now);
        return true;
    }
};
```

## 📱 Notificaciones Push

Para avisar cuando se capture una base:

```javascript
// Pedir permiso
Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
        // Service Worker puede enviar notificaciones
    }
});

// Enviar notificación
new Notification('Base Capturada!', {
    body: 'El equipo India ha capturado una base',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge.png',
    vibrate: [200, 100, 200]
});
```

## 🎯 Dashboard de Administrador

Crear un `admin.html` para ver capturas en tiempo real:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Admin</title>
    <style>
        /* Estilo de dashboard */
    </style>
</head>
<body>
    <h1>Capturas en Tiempo Real</h1>
    <div id="stats">
        <div>India: <span id="indiaCount">0</span></div>
        <div>Pakistán: <span id="pakistanCount">0</span></div>
    </div>
    <ul id="log"></ul>
    
    <script>
        // Poll API cada 5 segundos
        setInterval(async () => {
            const res = await fetch('/api/captures');
            const data = await res.json();
            updateDashboard(data);
        }, 5000);
    </script>
</body>
</html>
```

## 💾 IndexedDB para Mejor Storage

Para guardar más datos:

```javascript
const db = await openDB('airsoft-db', 1, {
    upgrade(db) {
        db.createObjectStore('captures', { keyPath: 'id', autoIncrement: true });
    }
});

// Guardar
await db.add('captures', {
    team: 'india',
    timestamp: Date.now(),
    synced: false
});

// Leer
const captures = await db.getAll('captures');
```

## 🧪 Testing Automatizado

Con Playwright:

```javascript
// test.spec.js
const { test, expect } = require('@playwright/test');

test('captura base India', async ({ page }) => {
    await page.goto('http://localhost:8080/?team=india');
    
    // Jugar el mini-juego
    await page.click('.pin[data-id="a"][data-side="left"]');
    await page.click('.pin[data-id="a"][data-side="right"]');
    // ... completar juego
    
    // Verificar éxito
    await expect(page.locator('.success-title')).toBeVisible();
});
```

---

## ⚡ Optimizaciones Avanzadas

### 1. Lazy Loading de Estilos
```html
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 2. Resource Hints
```html
<link rel="dns-prefetch" href="https://tu-api.com">
<link rel="preconnect" href="https://tu-api.com">
```

### 3. Compresión Brotli
Si usas servidor Node.js:
```javascript
const compression = require('compression');
app.use(compression());
```

---

**Nota**: El sitio actual ya está optimizado para el caso de uso principal. Solo implementa estas mejoras si realmente las necesitas. La simplicidad es una feature! 🎯
