# 📡 Ejemplo de Backend API

Este documento explica cómo implementar el endpoint de captura con **servidor tradicional** (Node.js, Python, PHP).

> **💡 ¿Usas Microsoft 365?** Si prefieres usar **Power Automate y SharePoint**, ve a [`BACKEND_POWERAUTOMATE.md`](./BACKEND_POWERAUTOMATE.md) para una solución sin servidores.

## Endpoint Requerido

**URL**: `/api/capture` (configurable)  
**Método**: `POST`  
**Content-Type**: `application/json`

## Request Body

```json
{
  "team": "india",
  "ts": "2025-10-06T12:34:56.789Z",
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "location": {
    "lat": -34.603722,
    "lng": -58.381592,
    "accuracy": 10
  }
}
```

### Campos

- `team` (string): `"india"` o `"pakistan"`
- `ts` (string): Timestamp ISO 8601
- `deviceId` (string): UUID v4 generado y persistido en el cliente
- `userAgent` (string): User agent del navegador
- `location` (object|null): Ubicación GPS del dispositivo
  - `lat` (number): Latitud
  - `lng` (number): Longitud
  - `accuracy` (number): Precisión en metros

## Response Esperada

**Éxito (200-299)**:
```json
{
  "success": true,
  "message": "Captura registrada",
  "points": 100
}
```

**Error (400+)**:
```json
{
  "success": false,
  "error": "Cooldown activo",
  "remainingTime": 1234567
}
```

---

## Ejemplo de Implementación

### Node.js + Express

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Almacenamiento en memoria (usar DB en producción)
const captures = new Map();
const COOLDOWN = 30 * 60 * 1000; // 30 minutos

app.use(express.json());

// Habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Endpoint de captura
app.post('/api/capture', (req, res) => {
  const { team, ts, deviceId, userAgent } = req.body;

  // Validación básica
  if (!team || !deviceId || !['india', 'pakistan'].includes(team)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Datos inválidos' 
    });
  }

  // Verificar cooldown
  const key = `${deviceId}:${team}`;
  const lastCapture = captures.get(key);
  
  if (lastCapture) {
    const elapsed = Date.now() - lastCapture;
    if (elapsed < COOLDOWN) {
      return res.status(429).json({
        success: false,
        error: 'Cooldown activo',
        remainingTime: COOLDOWN - elapsed
      });
    }
  }

  // Registrar captura
  captures.set(key, Date.now());

  // Aquí podrías:
  // - Guardar en base de datos
  // - Enviar email/notificación
  // - Actualizar marcador en tiempo real
  // - Registrar en log

  console.log(`✅ ${team.toUpperCase()} - Captura registrada:`, {
    deviceId,
    timestamp: new Date(ts).toLocaleString(),
    userAgent: userAgent.substring(0, 50) + '...'
  });

  res.json({
    success: true,
    message: 'Captura registrada correctamente',
    team,
    points: 100
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
```

### Python + Flask

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)

# Almacenamiento en memoria
captures = {}
COOLDOWN = timedelta(minutes=30)

@app.route('/api/capture', methods=['POST'])
def capture():
    data = request.get_json()
    
    team = data.get('team')
    device_id = data.get('deviceId')
    ts = data.get('ts')
    user_agent = data.get('userAgent')
    
    # Validación
    if not team or team not in ['india', 'pakistan'] or not device_id:
        return jsonify({
            'success': False,
            'error': 'Datos inválidos'
        }), 400
    
    # Verificar cooldown
    key = f"{device_id}:{team}"
    last_capture = captures.get(key)
    
    if last_capture:
        elapsed = datetime.now() - last_capture
        if elapsed < COOLDOWN:
            remaining = (COOLDOWN - elapsed).total_seconds()
            return jsonify({
                'success': False,
                'error': 'Cooldown activo',
                'remainingTime': int(remaining * 1000)
            }), 429
    
    # Registrar captura
    captures[key] = datetime.now()
    
    print(f"✅ {team.upper()} - Captura registrada:")
    print(f"   Device: {device_id}")
    print(f"   Timestamp: {ts}")
    
    return jsonify({
        'success': True,
        'message': 'Captura registrada correctamente',
        'team': team,
        'points': 100
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
```

### PHP

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$team = $data['team'] ?? null;
$deviceId = $data['deviceId'] ?? null;
$ts = $data['ts'] ?? null;
$userAgent = $data['userAgent'] ?? '';

// Validación
if (!$team || !in_array($team, ['india', 'pakistan']) || !$deviceId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

// En producción, usar base de datos
// Aquí solo un ejemplo con archivo temporal
$capturesFile = '/tmp/captures.json';
$captures = file_exists($capturesFile) 
    ? json_decode(file_get_contents($capturesFile), true) 
    : [];

$key = "{$deviceId}:{$team}";
$cooldown = 30 * 60; // 30 minutos en segundos

if (isset($captures[$key])) {
    $elapsed = time() - $captures[$key];
    if ($elapsed < $cooldown) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Cooldown activo',
            'remainingTime' => ($cooldown - $elapsed) * 1000
        ]);
        exit;
    }
}

// Registrar captura
$captures[$key] = time();
file_put_contents($capturesFile, json_encode($captures));

// Log
error_log("✅ {$team} - Captura: {$deviceId} @ {$ts}");

echo json_encode([
    'success' => true,
    'message' => 'Captura registrada correctamente',
    'team' => $team,
    'points' => 100
]);
?>
```

---

## Consideraciones de Seguridad

### 1. Validar en el Servidor

El cooldown del cliente es solo UX. **SIEMPRE validar en el servidor**:
- Verificar `deviceId` contra base de datos
- Opcional: También validar por IP
- Rate limiting por IP/dispositivo

### 2. CORS

Si tu frontend está en un dominio diferente al backend, configura CORS correctamente:

```javascript
// Node.js/Express
const cors = require('cors');
app.use(cors({
  origin: 'https://tu-usuario.github.io',
  methods: ['POST']
}));
```

### 3. Base de Datos

Para producción, usa una base de datos real:

**MongoDB**:
```javascript
{
  deviceId: "uuid",
  team: "india",
  timestamp: ISODate("2025-10-06T12:34:56Z"),
  userAgent: "...",
  ip: "123.45.67.89"
}
```

**PostgreSQL/MySQL**:
```sql
CREATE TABLE captures (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(36) NOT NULL,
  team VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address VARCHAR(45),
  INDEX idx_cooldown (device_id, team, timestamp)
);
```

### 4. Notificaciones

Puedes enviar notificaciones cuando se capture una base:

```javascript
// Email con Nodemailer
const nodemailer = require('nodemailer');

async function notifyCapture(team) {
  const transporter = nodemailer.createTransport({...});
  
  await transporter.sendMail({
    to: 'admin@evento.com',
    subject: `¡Base ${team} capturada!`,
    text: `El equipo ${team} ha capturado una base.`
  });
}
```

```javascript
// WebSocket para actualizaciones en tiempo real
io.emit('baseCapture', {
  team,
  timestamp: Date.now(),
  totalCaptures: getTotalCaptures(team)
});
```

---

## Testing

Prueba el endpoint con `curl`:

```bash
curl -X POST http://localhost:3000/api/capture \
  -H "Content-Type: application/json" \
  -d '{
    "team": "india",
    "ts": "2025-10-06T12:00:00.000Z",
    "deviceId": "test-uuid-1234",
    "userAgent": "Test Agent"
  }'
```

---

## Despliegue

### Vercel (Node.js)
1. `vercel deploy`
2. Configura CORS para tu dominio de GitHub Pages

### Heroku
1. `heroku create`
2. `git push heroku main`
3. Añade la URL a tu `index.html`

### AWS Lambda
1. Usa API Gateway
2. Configura función Lambda
3. Habilita CORS en API Gateway

---

¡Tu backend está listo! 🚀
