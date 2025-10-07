# 📊 Ejemplos de Payloads

## 1. Payload Estándar (Con GPS)

```json
{
  "team": "india",
  "ts": "2025-10-06T15:30:45.123Z",
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 10
  }
}
```

## 2. Payload sin GPS

```json
{
  "team": "pakistan",
  "ts": "2025-10-06T16:00:00.000Z",
  "deviceId": "xyz789-1234-5678-90ab-cdef12345678",
  "userAgent": "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36",
  "location": null
}
```

## 3. Payload con Alta Precisión GPS

```json
{
  "team": "india",
  "ts": "2025-10-06T17:15:30.456Z",
  "deviceId": "test-device-001",
  "userAgent": "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
  "location": {
    "lat": -32.83115,
    "lng": -60.70557,
    "accuracy": 5
  }
}
```

## 4. Respuesta Exitosa del Servidor

```json
{
  "success": true,
  "message": "Base capturada correctamente",
  "team": "india",
  "captureId": 42,
  "points": 100,
  "timestamp": "2025-10-06T15:30:45.789Z"
}
```

## 5. Respuesta con Error: Cooldown Activo

```json
{
  "success": false,
  "error": "Cooldown activo",
  "remainingTime": 1200000,
  "message": "Debes esperar 20 minutos"
}
```

Status Code: `429 Too Many Requests`

## 6. Respuesta con Error: Servidor

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Error al guardar en base de datos"
}
```

Status Code: `500 Internal Server Error`

## 7. Payload para Testing Power Automate

```json
{
  "team": "pakistan",
  "ts": "2025-10-06T18:00:00.000Z",
  "deviceId": "test-powerautomate-001",
  "userAgent": "Test User Agent / PowerAutomate Testing",
  "location": {
    "lat": -32.83110,
    "lng": -60.70560,
    "accuracy": 15
  }
}
```

## Notas Técnicas

### Formato de Timestamp
- **ISO 8601**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **Zona horaria**: UTC (Z)
- **JavaScript**: `new Date().toISOString()`

### DeviceID
- **Formato**: UUID v4
- **Generación**: `crypto.randomUUID()` o fallback custom
- **Persistencia**: LocalStorage
- **Ejemplo**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Coordenadas GPS
- **Latitud**: -90 a 90 (5 decimales)
- **Longitud**: -180 a 180 (5 decimales)
- **Precisión**: 1.1 metros con 5 decimales
- **SharePoint**: Máximo 5 decimales en columnas numéricas

### Accuracy (Precisión GPS)
- **Unidad**: Metros
- **Típico móvil**: 5-50m
- **Con GPS activo**: 5-20m
- **Solo WiFi/Cell**: 20-100m
- **Formato**: Número entero

### UserAgent
Ejemplos comunes:
- **iPhone**: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...`
- **Android**: `Mozilla/5.0 (Linux; Android 13; SM-G991B...`
- **iPad**: `Mozilla/5.0 (iPad; CPU OS 16_0...`

## Comandos para Testing

### Con curl (Bash/PowerShell)

```bash
curl -X POST https://tu-flow.logic.azure.com/... \
  -H "Content-Type: application/json" \
  -d @examples/sharepoint-payload.json
```

### Con PowerShell

```powershell
$payload = Get-Content examples\sharepoint-payload.json
Invoke-RestMethod -Uri "https://tu-flow.logic.azure.com/..." -Method POST -Body $payload -ContentType "application/json"
```

### Con Postman

1. **Método**: POST
2. **URL**: Tu endpoint de Power Automate
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body**: Raw → JSON → Copiar ejemplo de arriba

### Con JavaScript (Browser Console)

```javascript
fetch('https://tu-flow.logic.azure.com/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    team: 'india',
    ts: new Date().toISOString(),
    deviceId: crypto.randomUUID(),
    userAgent: navigator.userAgent,
    location: { lat: -32.83114, lng: -60.70558, accuracy: 10 }
  })
})
.then(r => r.json())
.then(console.log);
```

## Estructura para SharePoint

### Mapeo de Campos

| Payload | SharePoint Column | Tipo |
|---------|-------------------|------|
| `team` | Equipo | Choice (India, Pakistan) |
| `ts` | Timestamp | Date & Time |
| `deviceId` | DeviceID | Single line text |
| `userAgent` | UserAgent | Multiple lines text |
| `location.lat` | Latitud | Number (5 decimals) |
| `location.lng` | Longitud | Number (5 decimals) |
| `location.accuracy` | Precision | Number (0 decimals) |
| `hqValidation.distanceMeters` | DistanciaHQ | Number (0 decimals) |

### Ejemplo de Item en SharePoint

```
Title: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Equipo: India
Timestamp: 10/6/2025 3:30 PM
DeviceID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Latitud: -32.83114
Longitud: -60.70558
Precision: 10
Estado: Activa
```

## Validaciones Recomendadas

### En el Frontend (app.js)
- ✅ Team debe ser 'india' o 'pakistan'
- ✅ DeviceID formato UUID
- ✅ Coordenadas redondeadas a 5 decimales
- ✅ Accuracy redondeado a entero

### En el Backend (Power Automate)
- ✅ Verificar cooldown (60 min)
- ✅ Validar formato de timestamp
- ✅ Verificar que team sea válido
- ✅ Opcional: Validar distancia al evento (<100m)
- ✅ Opcional: Rate limiting por IP

---

**💡 Tip**: Usa estos ejemplos para probar tu Flow de Power Automate antes de conectar el frontend real.
