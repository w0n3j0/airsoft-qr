# 📦 Sistema de Cargamentos - Backend Power Automate

## 📋 Resumen del Sistema

### Estados del Cargamento:
1. **🔶 En Posesión** - Estado inicial (default)
2. **✅ Capturado** - Capturado por el equipo atacante

### 1 QR Code por Cargamento:
- **QR Captura**: `cargamento.html?cargo=X` → Captura el cargamento

---

## 🗂️ Estructura de SharePoint

### Lista: "Cargamentos"

Crear una lista con las siguientes columnas:

| Display Name | Internal Name | Type | Description |
|--------------|---------------|------|-------------|
| Title | Title | Single line of text | Número del cargamento ("1", "2", "3") |
| Estado | field_1 | Choice | "En posesión" o "Capturado" |
| DeviceID | field_2 | Single line of text | ID del dispositivo que capturó |
| Timestamp | field_3 | Date and Time | Fecha/hora de captura |
| Latitud | field_4 | Number | Latitud GPS (5 decimales) |
| Longitud | field_5 | Number | Longitud GPS (5 decimales) |
| Precisión | field_6 | Number | Precisión GPS en metros |

### Crear 3 Items Iniciales

Agrega manualmente 3 registros:
- **Title**: "1", **Estado**: "En posesión"
- **Title**: "2", **Estado**: "En posesión"
- **Title**: "3", **Estado**: "En posesión"

---

## 🔄 Flow POST: Capturar Cargamento

### 1. **Trigger: HTTP Request**
- Method: POST
- Content-Type: application/json

### 2. **Parse JSON**

Schema:
```json
{
  "type": "object",
  "properties": {
    "cargo": { "type": "string" },
    "action": { "type": "string" },
    "ts": { "type": "string" },
    "deviceId": { "type": "string" },
    "userAgent": { "type": "string" },
    "location": {
      "type": "object",
      "properties": {
        "lat": { "type": "number" },
        "lng": { "type": "number" },
        "accuracy": { "type": "number" }
      }
    }
  }
}
```

### 3. **Get Items (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Cargamentos"
- Filter Query: `Title eq '@{body('Parse_JSON')?['cargo']}'`
- Top Count: 1

### 4. **Condition: Verificar si ya está capturado**

**Expresión:**
```
@{first(body('Get_items')?['value'])?['field_1']}
```

**Condition:**
```
is equal to 'Capturado'
```

#### **If True** (Ya capturado):
- **Response (400)**
```json
{
  "success": false,
  "error": "Este cargamento ya fue capturado"
}
```

#### **If False** (Puede capturar):

**Update Item (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Cargamentos"
- Id: `@{first(body('Get_items')?['value'])?['ID']}`
- Fields:
  ```
  field_1: "Capturado"
  field_2: @{body('Parse_JSON')?['deviceId']}
  field_3: @{body('Parse_JSON')?['ts']}
  field_4: @{body('Parse_JSON')?['location']?['lat']}
  field_5: @{body('Parse_JSON')?['location']?['lng']}
  field_6: @{body('Parse_JSON')?['location']?['accuracy']}
  ```

**Response (200)**
```json
{
  "success": true,
  "message": "Cargamento capturado con éxito",
  "cargo": "@{body('Parse_JSON')?['cargo']}",
  "timestamp": "@{body('Parse_JSON')?['ts']}"
}
```

---

## 📊 Flow GET: Consultar Estado

### 1. **Trigger: HTTP Request**
- Method: GET

### 2. **Get Items (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Cargamentos"
- Order By: Title (ascending)

### 3. **Response (200)**

**Body:**
```json
{
  "value": @{body('Get_items')?['value']}
}
```

---

## 📥 Request Body (POST)

```json
{
  "cargo": "1",
  "action": "capture",
  "ts": "2025-10-10T15:30:00.000Z",
  "deviceId": "device-abc123",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 15
  }
}
```

---

## 📤 Response GET

```json
{
  "value": [
    {
      "ID": 1,
      "Title": "1",
      "field_1": "Capturado",
      "field_2": "device-abc123",
      "field_3": "2025-10-10T15:30:00Z",
      "field_4": -32.83114,
      "field_5": -60.70558,
      "field_6": 15,
      "Modified": "2025-10-10T15:30:00Z"
    },
    {
      "ID": 2,
      "Title": "2",
      "field_1": "En posesión",
      "field_2": null,
      "field_3": null,
      "Modified": "2025-10-10T00:00:00Z"
    },
    {
      "ID": 3,
      "Title": "3",
      "field_1": "En posesión",
      "field_2": null,
      "field_3": null,
      "Modified": "2025-10-10T00:00:00Z"
    }
  ]
}
```

---

## 🎯 Reglas de Negocio

### Transiciones Permitidas:
- **En Posesión** → **Capturado** ✅
- **Capturado** → **Capturado** ❌ (No se puede recapturar)

### Validaciones:
1. Solo se puede capturar una vez por cargamento
2. El timestamp queda registrado en el momento de la captura
3. La ubicación GPS se guarda para análisis posterior

---

## 🧪 Testing con PowerShell

### Test: Capturar Cargamento 1
```powershell
$body = @{
    cargo = "1"
    action = "capture"
    ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    deviceId = "test-device-123"
    location = @{
        lat = -32.83114
        lng = -60.70558
        accuracy = 15
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "TU_URL_AQUI" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test: Verificar Estados
```powershell
$response = Invoke-WebRequest -Uri "TU_URL_GET_AQUI" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test: Intentar Recapturar (Debe Fallar)
```powershell
# Ejecuta el primer script nuevamente
# Debería retornar error 400: "Este cargamento ya fue capturado"
```

---

## 📱 URLs de Producción

### QR Codes para Imprimir:

**Cargamento 1:**
- Capturar: `https://w0n3j0.github.io/airsoft-qr/cargamento.html?cargo=1`

**Cargamento 2:**
- Capturar: `https://w0n3j0.github.io/airsoft-qr/cargamento.html?cargo=2`

**Cargamento 3:**
- Capturar: `https://w0n3j0.github.io/airsoft-qr/cargamento.html?cargo=3`

---

## 🎨 Visualización en Métricas

### Colores por Estado:
- 🔶 **En Posesión**: Naranja pulsante
- ✅ **Capturado**: Verde sólido

### Información Mostrada:
- Número de cargamento
- Estado actual
- Timestamp de captura (si aplica)
- Device ID del capturador

---

## 🚀 Próximos Pasos

1. ✅ Crear lista "Cargamentos" en SharePoint
2. ✅ Agregar 3 items con estado "En posesión"
3. ✅ Crear Flow POST con validación de estado
4. ✅ Crear Flow GET para consultas
5. ✅ Configurar `config.json` con URLs
6. ✅ Generar 3 QR codes de captura
7. ✅ Probar cada cargamento
8. ✅ Verificar visualización en métricas
9. ✅ Deploy a producción

---

## ⚠️ Notas Importantes

- Los cargamentos **NO** se pueden recapturar una vez tomados
- Esto es diferente a los misiles que tienen 3 estados
- Los cargamentos son objetivos de una sola vez
- El timestamp registra el momento exacto de la captura
- La ubicación GPS ayuda a validar capturas legítimas

---

## 📊 Comparación con Misiles

| Característica | Misiles | Cargamentos |
|----------------|---------|-------------|
| **Estados** | 3 (Armado, Lanzado, Desactivado) | 2 (En Posesión, Capturado) |
| **QR Codes** | 2 por misil | 1 por cargamento |
| **Acciones** | Lanzar O Desactivar | Solo Capturar |
| **Reversible** | Sí (excepto desactivado) | No |
| **Objetivo** | Secundario táctico | Secundario estratégico |

---

¡Sistema de cargamentos listo! 📦✅
