# 🚀 Guía de Configuración del Backend para Misiles

Esta guía te ayudará a configurar el sistema de **3 misiles** como objetivos secundarios en tu evento de Airsoft usando Power Automate y SharePoint.

## 📋 Tabla de Contenidos

1. [Crear Lista en SharePoint](#1-crear-lista-en-sharepoint)
2. [Crear Flow en Power Automate](#2-crear-flow-en-power-automate)
3. [Configurar el Frontend](#3-configurar-el-frontend)
4. [Generar QR Codes](#4-generar-qr-codes)
5. [Testing](#5-testing)

---

## 1. Crear Lista en SharePoint

### Paso 1.1: Crear la Lista

1. Ve a tu sitio de SharePoint
2. Haz clic en **⚙️ Settings** → **Site contents** → **+ New** → **List**
3. Nombre: `Misiles` (o el nombre que prefieras)
4. Descripción: `Registro de desactivación de misiles`
5. Haz clic en **Create**

### Paso 1.2: Agregar Columnas

Elimina la columna `Title` por defecto y crea las siguientes:

| Nombre de Columna | Tipo | Configuración |
|-------------------|------|---------------|
| **Misil** | Choice | Valores: `1`, `2`, `3` <br> Requerido: ✅ |
| **Estado** | Choice | Valores: `Armado`, `Desactivado` <br> Default: `Armado` <br> Requerido: ✅ |
| **DeviceID** | Single line of text | Max length: 255 |
| **Timestamp** | Date and Time | Include time: ✅ |
| **Latitud** | Number | Decimals: 5 <br> Min: -90, Max: 90 |
| **Longitud** | Number | Decimals: 5 <br> Min: -180, Max: 180 |
| **Precision** | Number | Decimals: 0 (metros) |

### Paso 1.3: Inicializar los Misiles

Crea manualmente 3 items en la lista:

1. **Item 1:**
   - Misil: `1`
   - Estado: `Armado`
   - (dejar otros campos vacíos)

2. **Item 2:**
   - Misil: `2`
   - Estado: `Armado`
   - (dejar otros campos vacíos)

3. **Item 3:**
   - Misil: `3`
   - Estado: `Armado`
   - (dejar otros campos vacíos)

---

## 2. Crear Flow en Power Automate

Necesitas crear **2 Flows**:
- **Flow 1:** Para desactivar misiles (POST)
- **Flow 2:** Para consultar estado (GET) - usado por métricas

### 2.1. Flow para Desactivar Misiles (POST)

#### Paso 1: Crear el Flow

1. Ve a [Power Automate](https://make.powerautomate.com)
2. **+ Create** → **Instant cloud flow**
3. Nombre: `Airsoft - Desactivar Misil`
4. Trigger: **When a HTTP request is received**
5. Haz clic en **Create**

#### Paso 2: Configurar el Trigger

En el trigger "When a HTTP request is received":

**Request Body JSON Schema:**

```json
{
  "type": "object",
  "properties": {
    "missile": {
      "type": "string",
      "description": "Número del misil (1, 2 o 3)"
    },
    "ts": {
      "type": "string",
      "description": "Timestamp ISO 8601"
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
  "required": ["missile", "ts", "deviceId"]
}
```

#### Paso 3: Validar el Misil

**Agregar acción:** `Condition`
- **Nombre:** Validar número de misil
- **Condición:**
  - `missile` is equal to `1`
  - **OR** `missile` is equal to `2`
  - **OR** `missile` is equal to `3`

#### Paso 4: Si es inválido (rama "No")

**Agregar acción:** `Response`
- **Status Code:** `400`
- **Body:**
```json
{
  "error": "Misil inválido. Use 1, 2 o 3",
  "missile": "@{triggerBody()?['missile']}"
}
```

#### Paso 5: Si es válido (rama "Yes")

##### 5.1 Obtener el Item del Misil

**Agregar acción:** `Get items` (SharePoint)
- **Site Address:** Tu sitio de SharePoint
- **List Name:** `Misiles`
- **Filter Query:** `Misil eq '@{triggerBody()?['missile']}'`
- **Top Count:** `1`

##### 5.2 Verificar si ya fue desactivado

**Agregar acción:** `Condition`
- **Nombre:** Ya desactivado?
- **Condición:**
  - `Estado` (del Get items) is equal to `Desactivado`

##### 5.3 Si ya estaba desactivado (rama "Yes")

**Agregar acción:** `Response`
- **Status Code:** `409` (Conflict)
- **Body:**
```json
{
  "error": "Este misil ya fue desactivado",
  "missile": "@{triggerBody()?['missile']}",
  "deactivatedAt": "@{first(body('Get_items')?['value'])?['Timestamp']}",
  "deactivatedBy": "@{first(body('Get_items')?['value'])?['DeviceID']}"
}
```

##### 5.4 Si está armado (rama "No")

**Agregar acción:** `Update item` (SharePoint)
- **Site Address:** Tu sitio de SharePoint
- **List Name:** `Misiles`
- **Id:** `@{first(body('Get_items')?['value'])?['ID']}`
- **Estado:** `Desactivado`
- **DeviceID:** `@{triggerBody()?['deviceId']}`
- **Timestamp:** `@{triggerBody()?['ts']}`
- **Latitud:** `@{triggerBody()?['location']?['lat']}`
- **Longitud:** `@{triggerBody()?['location']?['lng']}`
- **Precision:** `@{triggerBody()?['location']?['accuracy']}`

**Agregar acción:** `Response`
- **Status Code:** `200`
- **Body:**
```json
{
  "success": true,
  "message": "Misil desactivado con éxito",
  "missile": "@{triggerBody()?['missile']}",
  "timestamp": "@{triggerBody()?['ts']}"
}
```

#### Paso 6: Guardar y Copiar URL

1. Haz clic en **Save**
2. Vuelve al trigger "When a HTTP request is received"
3. **Copia la URL HTTP POST** que aparece
4. Esta es tu `missileApiUrl` para `config.json`

---

### 2.2. Flow para Consultar Estado (GET)

Este Flow es para que la página de métricas pueda consultar el estado de los misiles.

#### Paso 1: Crear el Flow

1. **+ Create** → **Instant cloud flow**
2. Nombre: `Airsoft - Obtener Estado Misiles`
3. Trigger: **When a HTTP request is received**

#### Paso 2: Configurar el Trigger

- **Method:** `GET`
- **No se necesita Request Body Schema** (es un GET)

#### Paso 3: Obtener Todos los Misiles

**Agregar acción:** `Get items` (SharePoint)
- **Site Address:** Tu sitio de SharePoint
- **List Name:** `Misiles`
- **Order By:** `Misil` (Ascending)

#### Paso 4: Responder con los Datos

**Agregar acción:** `Response`
- **Status Code:** `200`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**
```json
{
  "value": @{body('Get_items')?['value']}
}
```

#### Paso 5: Guardar y Copiar URL

1. Haz clic en **Save**
2. **Copia la URL HTTP GET**
3. Esta es tu `missileMetricsUrl` para `config.json`

---

## 3. Configurar el Frontend

### Paso 3.1: Editar `config.json`

```json
{
  "apiUrl": "TU_URL_DE_CAPTURAS_AQUI",
  "missileApiUrl": "URL_DEL_FLOW_DESACTIVAR_MISIL",
  "missileMetricsUrl": "URL_DEL_FLOW_OBTENER_ESTADO_MISILES",
  "cooldownMinutes": 30,
  "eventLocation": {
    "lat": -32.8311426,
    "lng": -60.7055789,
    "name": "Rosario, Argentina"
  }
}
```

### Paso 3.2: Verificar que los Archivos Estén en tu Repo

Asegúrate de tener:
- ✅ `misil.html` - Página para escanear y desactivar misiles
- ✅ `metrics.html` - Actualizado con el panel de misiles
- ✅ `config.json` - Con las URLs configuradas

---

## 4. Generar QR Codes

Genera 3 códigos QR para cada misil:

### 🚀 Misil 1
```
https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=1
```

### 🚀 Misil 2
```
https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=2
```

### 🚀 Misil 3
```
https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=3
```

**Herramientas recomendadas:**
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)
- Comando CLI: `qrencode -o misil1.png "URL"`

**Consejos para el evento:**
- Imprime cada QR en formato A5 o más grande
- Plastifica los códigos para protegerlos
- Coloca cada QR en un lugar estratégico del campo
- Considera agregar el número del misil en grande junto al QR

---

## 5. Testing

### 5.1. Test Manual desde la Web

1. Abre `misil.html?missile=1` en tu navegador
2. Verifica que aparece "MISIL 1" con estado "ARMADO"
3. Haz clic en **DESACTIVAR AHORA**
4. Debe aparecer "MISIL DESACTIVADO" con éxito
5. Recarga la página → Debe mostrar "YA DESACTIVADO"

### 5.2. Test desde Métricas

1. Abre `metrics.html`
2. En la sección "🚀 Estado de Misiles" deben aparecer los 3 misiles
3. Los que desactivaste deben aparecer con 🟢 DESACTIVADO
4. Los otros con 🔴 ARMADO

### 5.3. Test con Postman (Opcional)

**POST - Desactivar Misil:**
```http
POST {{missileApiUrl}}
Content-Type: application/json

{
  "missile": "1",
  "ts": "2025-10-07T12:00:00.000Z",
  "deviceId": "test-device-123",
  "userAgent": "Test",
  "location": {
    "lat": -32.83114,
    "lng": -60.70558,
    "accuracy": 10
  }
}
```

**GET - Obtener Estado:**
```http
GET {{missileMetricsUrl}}
```

---

## 🔧 Troubleshooting

### Error: "Misil inválido"
- Verifica que el parámetro `?missile=` sea 1, 2 o 3
- Revisa la URL del QR code

### Error: "Este misil ya fue desactivado"
- Es correcto, el misil solo puede desactivarse una vez
- Para resetear, cambia manualmente el campo "Estado" a "Armado" en SharePoint

### No aparecen los misiles en métricas
- Verifica que `missileMetricsUrl` esté configurado en `config.json`
- Abre la consola del navegador (F12) y busca errores
- Verifica que el Flow GET esté activado

### El Flow no se ejecuta
- Verifica que el Flow esté **activado** (ON)
- Revisa el historial de ejecución en Power Automate
- Verifica los permisos de SharePoint

---

## 📊 Estructura de Datos en SharePoint

### Lista: Misiles

| ID | Misil | Estado | DeviceID | Timestamp | Latitud | Longitud | Precision |
|----|-------|--------|----------|-----------|---------|----------|-----------|
| 1  | 1     | Desactivado | abc-123 | 2025-10-07 14:30 | -32.83114 | -60.70558 | 10 |
| 2  | 2     | Armado  | - | - | - | - | - |
| 3  | 3     | Armado  | - | - | - | - | - |

---

## 🎯 Uso en el Evento

### Preparación

1. **Antes del evento:**
   - Verifica que los 3 misiles estén en estado "Armado" en SharePoint
   - Imprime y coloca los QR codes en ubicaciones estratégicas
   - Prueba escaneando un QR desde un móvil

2. **Durante el evento:**
   - Los jugadores encuentran los QR codes
   - Escanean y desactivan el misil
   - El estado se actualiza en tiempo real

3. **Monitoreo:**
   - Abre `metrics.html` en una tablet o laptop
   - Observa cuándo se desactivan los misiles
   - Anúncialos por radio al equipo organizador

### Reiniciar para Otro Evento

Para resetear los misiles:

1. Ve a la lista `Misiles` en SharePoint
2. Para cada item:
   - Cambia **Estado** a `Armado`
   - Limpia los campos: DeviceID, Timestamp, Latitud, Longitud, Precision
3. Guarda los cambios

---

## 🔐 Seguridad

- Las URLs de Power Automate incluyen un token `sig=` que actúa como autenticación
- Un misil solo puede desactivarse una vez
- El Flow valida el número de misil antes de procesar
- Los campos de ubicación son opcionales (funcionará sin GPS)

---

## 📄 Recursos Adicionales

- [Documentación oficial de Power Automate](https://docs.microsoft.com/power-automate/)
- [SharePoint Lists REST API](https://docs.microsoft.com/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)
- [README principal del proyecto](./README.md)

---

**¿Preguntas?** Abre un [issue](https://github.com/w0n3j0/airsoft-qr/issues) en GitHub

**¡Buena suerte con tus misiles! 🚀**
