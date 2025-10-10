# 🚀 Sistema de Misiles V2 - Backend Power Automate

## 📋 Resumen de Cambios

### Nuevo Sistema de 3 Estados:
1. **🔴 Armado** - Estado inicial (default)
2. **🟢 Desactivado** - QR de desactivación escaneado
3. **🚀 Lanzado** - QR de lanzamiento escaneado

### 2 QR Codes por Misil:
- **QR Desactivación**: `misil.html?missile=X` → Desactiva el misil
- **QR Lanzamiento**: `lanzar-misil.html?missile=X` → Lanza el misil

---

## 🔧 Configuración de Power Automate

### Flow Unificado: Gestión de Misiles

El mismo flow POST ahora maneja ambas acciones mediante el campo `action`.

#### 📥 Request Body

```json
{
  "missile": "1",
  "action": "deactivate",  // o "launch"
  "ts": "2025-10-08T10:30:00.000Z",
  "deviceId": "abc123-device-id",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 15
  }
}
```

---

## 🔄 Lógica del Flow POST (Actualizada)

### 1. **Trigger HTTP Request**
- Method: POST
- Content-Type: application/json

### 2. **Parse JSON**

Schema:
```json
{
  "type": "object",
  "properties": {
    "missile": { "type": "string" },
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

### 3. **Switch (Condition por Action)**

#### Case: action = "deactivate"

**Get Item (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Misiles"
- Filter: `Title eq '@{body('Parse_JSON')?['missile']}'`

**Update Item (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Misiles"
- Id: `@{body('Get_Item')?['ID']}`
- Fields:
  ```
  field_1: "Desactivado"
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
  "message": "Misil desactivado con éxito",
  "missile": "@{body('Parse_JSON')?['missile']}",
  "action": "deactivate",
  "timestamp": "@{body('Parse_JSON')?['ts']}"
}
```

#### Case: action = "launch"

**Get Item (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Misiles"
- Filter: `Title eq '@{body('Parse_JSON')?['missile']}'`

**Condition: Verificar si ya está desactivado**
```
@{body('Get_Item')?['field_1']} is equal to 'Desactivado'
```

**If True** (Ya desactivado):
- Response (400)
```json
{
  "success": false,
  "error": "El misil ya fue desactivado y no puede ser lanzado"
}
```

**If False** (Puede lanzar):

**Update Item (SharePoint)**
- Site: Tu sitio SharePoint
- List: "Misiles"
- Id: `@{body('Get_Item')?['ID']}`
- Fields:
  ```
  field_1: "Lanzado"
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
  "message": "Misil lanzado con éxito",
  "missile": "@{body('Parse_JSON')?['missile']}",
  "action": "launch",
  "timestamp": "@{body('Parse_JSON')?['ts']}"
}
```

#### Default Case (Action inválida)

**Response (400)**
```json
{
  "success": false,
  "error": "Acción inválida. Use 'deactivate' o 'launch'"
}
```

---

## 📊 Flow GET (Sin Cambios)

El endpoint GET sigue devolviendo todos los misiles con su estado actual.

**Response:**
```json
{
  "value": [
    {
      "ID": 1,
      "Title": "1",
      "field_1": "Lanzado",
      "field_2": "device-abc123",
      "field_3": "2025-10-08T10:30:00Z",
      "field_4": -32.83114,
      "field_5": -60.70558,
      "field_6": 15,
      "Modified": "2025-10-08T10:30:00Z",
      "Editor": {
        "DisplayName": "Sistema"
      }
    },
    {
      "ID": 2,
      "Title": "2",
      "field_1": "Desactivado",
      "field_2": "device-xyz789",
      "field_3": "2025-10-08T09:15:00Z",
      "Modified": "2025-10-08T09:15:00Z"
    },
    {
      "ID": 3,
      "Title": "3",
      "field_1": "Armado",
      "field_2": null,
      "field_3": null,
      "Modified": "2025-10-07T00:00:00Z"
    }
  ]
}
```

---

## 🎯 Reglas de Negocio

### Prioridad de Estados:
1. **Desactivado** > **Lanzado** > **Armado**
2. Si un misil está **Desactivado**, NO puede ser lanzado
3. Si un misil está **Lanzado**, puede ser desactivado (pero NO relanzado)
4. Si un misil está **Armado**, puede ser desactivado O lanzado

### Matriz de Transiciones:

| Estado Actual | Puede Desactivar | Puede Lanzar |
|---------------|------------------|--------------|
| Armado        | ✅ Sí           | ✅ Sí        |
| Lanzado       | ✅ Sí           | ❌ No        |
| Desactivado   | ❌ No           | ❌ No        |

---

## 🧪 Testing con PowerShell

### Test: Desactivar Misil 1
```powershell
$body = @{
    missile = "1"
    action = "deactivate"
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

### Test: Lanzar Misil 2
```powershell
$body = @{
    missile = "2"
    action = "launch"
    ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    deviceId = "test-device-456"
    location = @{
        lat = -32.83114
        lng = -60.70558
        accuracy = 20
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

---

## 📱 URLs de Producción

### QR Codes para Imprimir:

**Misil 1:**
- Desactivar: `https://w0n3j0.github.io/airsoft-qr/misil.html?missile=1`
- Lanzar: `https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=1`

**Misil 2:**
- Desactivar: `https://w0n3j0.github.io/airsoft-qr/misil.html?missile=2`
- Lanzar: `https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=2`

**Misil 3:**
- Desactivar: `https://w0n3j0.github.io/airsoft-qr/misil.html?missile=3`
- Lanzar: `https://w0n3j0.github.io/airsoft-qr/lanzar-misil.html?missile=3`

---

## 🎨 Visualización en Métricas

### Colores por Estado:
- 🔴 **Armado**: Rojo pulsante
- 🚀 **Lanzado**: Naranja animado
- 🟢 **Desactivado**: Verde sólido

---

## 🚀 Próximos Pasos

1. ✅ Actualizar el Flow POST con la lógica Switch
2. ✅ Configurar `config.json` con `missileLaunchUrl`
3. ✅ Generar 6 QR codes (3 para desactivar + 3 para lanzar)
4. ✅ Probar ambas acciones para cada misil
5. ✅ Verificar visualización en métricas
6. ✅ Deploy a producción

---

## ⚠️ Notas Importantes

- El mismo endpoint puede usarse para ambas acciones (diferenciado por `action`)
- O puedes crear 2 flows separados (`missileApiUrl` y `missileLaunchUrl`)
- Asegúrate de validar que un misil desactivado NO pueda ser lanzado
- Los timestamps en `field_3` reflejan la última acción (lanzamiento o desactivación)

---

¡Sistema de misiles dual-action listo! 🚀🎯
