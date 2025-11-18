# 🚀 Flow POST Misiles - Switch (Initiate & Deactivate)

**Propósito**: Manejar las acciones de **iniciar cuenta regresiva** (`initiate`) y **desactivar** (`deactivate`) misiles.

---

## 📋 Configuración del Flow

### Paso 1: Crear el Flow

1. Ve a **Power Automate** (https://make.powerautomate.com)
2. Click en **+ Create** → **Automated cloud flow**
3. **Nombre del Flow**: `Misiles - POST (Initiate & Deactivate)`
4. **Trigger**: Buscar "HTTP" → Seleccionar **"When a HTTP request is received"**
5. Click en **Create**

---

## 🔧 Paso 2: Configurar el Trigger HTTP

### Acción: When a HTTP request is received

1. En **Request Body JSON Schema**, pega esto:

```json
{
    "type": "object",
    "properties": {
        "missile": {
            "type": "string"
        },
        "action": {
            "type": "string"
        },
        "ts": {
            "type": "string"
        },
        "deviceId": {
            "type": "string"
        },
        "userAgent": {
            "type": "string"
        },
        "location": {
            "type": "object",
            "properties": {
                "lat": {
                    "type": "number"
                },
                "lng": {
                    "type": "number"
                },
                "accuracy": {
                    "type": "number"
                }
            }
        }
    },
    "required": [
        "missile",
        "action"
    ]
}
```

**Importante**: Este schema define que el payload DEBE tener `missile` y `action`.

---

## 🔧 Paso 3: Crear el Switch

### Acción: Switch

1. Click en **+ New step**
2. Buscar: `Switch`
3. Seleccionar: **Switch**
4. En **On**, seleccionar del contenido dinámico: `action`
   - O escribir manualmente: `triggerBody()?['action']`

---

## 🔧 Paso 4: Case "initiate" - Iniciar Cuenta Regresiva

### Dentro del Case 1:

1. Click en **Add an action** dentro del primer Case
2. En el campo **Equals**, escribir: `initiate`
3. Agregar acción: **SharePoint - Update item**
4. Configurar:

```
Site Address: [Tu sitio de SharePoint]
List Name: Misiles
Id: Buscar con Get items primero (ver sub-pasos abajo)
```

#### Sub-paso: Obtener el ID del misil

Antes del Update, necesitas obtener el ID del item en SharePoint:

**4.1. Get items (SharePoint)**
- Site Address: [Tu sitio]
- List Name: Misiles
- Filter Query: `Title eq '@{triggerBody()?['missile']}'`
- Top Count: 1

**4.2. Update item (SharePoint)**
- Site Address: [Tu sitio]
- List Name: Misiles
- Id: `ID` (del Get items)
- Title: `Title` (del Get items)
- field_1 (Estado): `Conteo`
- field_2 (DeviceID): `deviceId` (del trigger)
- field_3 (Timestamp): `ts` (del trigger)
- field_4 (Latitud): `triggerBody()?['location']?['lat']`
- field_5 (Longitud): `triggerBody()?['location']?['lng']`
- field_6 (Precisión): `triggerBody()?['location']?['accuracy']`

**4.3. Response (HTTP)**
- Status Code: `200`
- Headers: 
  ```
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "success": true,
    "message": "Cuenta regresiva iniciada",
    "missile": "@{triggerBody()?['missile']}",
    "countdown": 3600
  }
  ```

---

## 🔧 Paso 5: Case "deactivate" - Desactivar Misil

### Dentro del Case 2:

1. Click en **Add a case**
2. En el campo **Equals**, escribir: `deactivate`

#### Sub-pasos:

**5.1. Get items (SharePoint)** - Obtener estado actual
- Site Address: [Tu sitio]
- List Name: Misiles
- Filter Query: `Title eq '@{triggerBody()?['missile']}'`
- Top Count: 1

**5.2. Condition** - Verificar que NO esté lanzado

Crear una condición:
```
field_1 (del Get items)
is not equal to
Lanzado
```

**Si es verdadero (If yes):**

**5.3. Update item (SharePoint)**
- Site Address: [Tu sitio]
- List Name: Misiles
- Id: `ID` (del Get items)
- Title: `Title` (del Get items)
- field_1 (Estado): `Desactivado`
- field_2 (DeviceID): `deviceId` (del trigger)
- field_3 (Timestamp): `ts` (del trigger)
- field_4 (Latitud): `triggerBody()?['location']?['lat']`
- field_5 (Longitud): `triggerBody()?['location']?['lng']`
- field_6 (Precisión): `triggerBody()?['location']?['accuracy']`

**5.4. Response (HTTP)** - Dentro de "If yes"
- Status Code: `200`
- Body:
  ```json
  {
    "success": true,
    "message": "Misil desactivado",
    "missile": "@{triggerBody()?['missile']}"
  }
  ```

**Si es falso (If no):**

**5.5. Response (HTTP)** - Dentro de "If no"
- Status Code: `400`
- Body:
  ```json
  {
    "success": false,
    "error": "El misil ya fue lanzado y no puede ser desactivado"
  }
  ```

---

## 🔧 Paso 6: Default - Acción no válida

### En Default:

1. Agregar acción: **Response (HTTP)**
2. Configurar:

```
Status Code: 400
Headers:
  Content-Type: application/json
Body:
{
  "success": false,
  "error": "Acción no válida. Use 'initiate' o 'deactivate'"
}
```

---

## 📊 Diagrama Visual del Flow

```
┌─────────────────────────────────────┐
│  Trigger: HTTP Request Received    │
│  Body: { missile, action, ... }    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Switch: @triggerBody()['action']  │
└─────┬───────────────┬───────────────┘
      │               │
   [initiate]    [deactivate]    [default]
      │               │               │
      ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Get items│   │ Get items│   │ Response │
│ (Title=X)│   │ (Title=X)│   │   400    │
└────┬─────┘   └────┬─────┘   └──────────┘
     │              │
     ▼              ▼
┌──────────┐   ┌──────────┐
│  Update  │   │Condition │
│ Estado:  │   │ != Lanzado│
│ Conteo   │   └─┬────┬───┘
└────┬─────┘     │    │
     │         [Yes] [No]
     ▼           │    │
┌──────────┐     ▼    ▼
│ Response │  ┌────┐ ┌────┐
│   200    │  │Upd │ │Resp│
└──────────┘  │Desc│ │400 │
              └─┬──┘ └────┘
                │
                ▼
              ┌────┐
              │Resp│
              │200 │
              └────┘
```

---

## ⚙️ Expresiones Útiles

### Obtener valor del trigger:
```javascript
triggerBody()?['missile']      // Número del misil
triggerBody()?['action']       // Acción (initiate/deactivate)
triggerBody()?['ts']           // Timestamp
triggerBody()?['deviceId']     // Device ID
triggerBody()?['location']?['lat']   // Latitud
triggerBody()?['location']?['lng']   // Longitud
triggerBody()?['location']?['accuracy']  // Precisión
```

### Filter Query para SharePoint:
```
Title eq '@{triggerBody()?['missile']}'
```

### Response Body de éxito:
```json
{
  "success": true,
  "message": "@{outputs('Update_item')?['body']?['field_1']}",
  "missile": "@{triggerBody()?['missile']}"
}
```

---

## 🧪 Probar el Flow

### Test 1: Iniciar Cuenta Regresiva

**Payload de prueba:**
```json
{
  "missile": "1",
  "action": "initiate",
  "ts": "2025-11-18T22:00:00.000Z",
  "deviceId": "test-device-123",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 10
  }
}
```

**Resultado esperado:**
- SharePoint → Misil 1: Estado = "Conteo"
- Response: `{ "success": true, "countdown": 3600 }`

---

### Test 2: Desactivar Misil

**Payload de prueba:**
```json
{
  "missile": "2",
  "action": "deactivate",
  "ts": "2025-11-18T22:05:00.000Z",
  "deviceId": "test-device-456",
  "userAgent": "Mozilla/5.0...",
  "location": {
    "lat": -32.83200,
    "lng": -60.70600,
    "accuracy": 15
  }
}
```

**Resultado esperado:**
- SharePoint → Misil 2: Estado = "Desactivado"
- Response: `{ "success": true }`

---

## 🔍 Solución de Problemas

### Error: "The template language function 'equals' expects its parameter to be a string"
- **Causa**: El campo `action` es null
- **Solución**: Verifica el JSON Schema en el trigger

### Error: "Item not found"
- **Causa**: El Filter Query no encuentra el misil
- **Solución**: Verifica que en SharePoint existan items con Title "1", "2", "3"

### El Update no cambia el estado
- **Causa**: No estás usando el ID correcto
- **Solución**: Asegúrate de usar el `ID` del Get items (no el Title)

### Error: "Unable to process template language expressions"
- **Causa**: Sintaxis incorrecta en las expresiones
- **Solución**: Usa el editor de expresiones y verifica los `?` opcionales

---

## ✅ Checklist de Configuración

- [ ] Flow creado: "Misiles - POST (Initiate & Deactivate)"
- [ ] Trigger HTTP con JSON Schema configurado
- [ ] Switch con campo `action`
- [ ] Case "initiate" con Get items + Update + Response
- [ ] Case "deactivate" con Get items + Condition + Update + Response
- [ ] Default con Response 400
- [ ] Flow guardado
- [ ] Flow activado (toggle ON)
- [ ] URL del Flow copiada
- [ ] URL agregada a `config.json` en `missileApiUrl` y `missileLaunchUrl`
- [ ] Probado con Postman o test-misiles.html

---

## 🔗 Copiar URL del Flow

1. Una vez creado el Flow, ve al Trigger HTTP
2. Copia la **HTTP POST URL**
3. Pégala en `config.json`:

```json
{
  "missileApiUrl": "TU_URL_AQUI",
  "missileLaunchUrl": "TU_URL_AQUI"
}
```

**Nota**: Ambas URLs pueden ser la misma, ya que el Switch diferencia por el campo `action`.

---

## 🎯 Resumen de Estados

| Acción | Estado Antes | Estado Después | Condición |
|--------|--------------|----------------|-----------|
| **initiate** | Armado | Conteo | Ninguna |
| **initiate** | Conteo | Conteo | Ya iniciado (se sobrescribe) |
| **deactivate** | Armado | Desactivado | ✅ |
| **deactivate** | Conteo | Desactivado | ✅ |
| **deactivate** | Lanzado | Lanzado | ❌ Error 400 |
| **deactivate** | Desactivado | Desactivado | Ya desactivado |

---

¡Flow completo! 🚀 Ahora copia la URL y actualiza `config.json`.
