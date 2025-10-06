# 🔷 Backend con Power Automate y SharePoint

Guía completa para implementar el sistema de captura usando **Microsoft Power Automate** y **SharePoint Lists**.

## 🎯 Explicación Simple

**¿Qué vamos a hacer?**

1. **SharePoint** = Base de datos donde guardamos quién capturó qué y cuándo
2. **Power Automate** = El "cerebro" que recibe las capturas y decide si aceptarlas o rechazarlas
3. **Flow** = Es como una receta de cocina con pasos:
   - ¿Este celular ya capturó antes?
   - Si sí → ¿Pasaron 30 minutos?
   - Si no pasaron → Rechazar
   - Si pasaron (o es primera vez) → Guardar en SharePoint

**Analogía:** 
- El QR es como un timbre
- Power Automate es el portero
- SharePoint es el libro de visitas
- El cooldown es la regla de "solo una vez cada 30 minutos"

## 📋 Tabla de Contenidos

1. [Crear Lista de SharePoint](#1-crear-lista-de-sharepoint)
2. [Crear Flow en Power Automate](#2-crear-flow-en-power-automate)
3. [Configurar Endpoint](#3-configurar-endpoint)
4. [Actualizar Frontend](#4-actualizar-frontend)
5. [Validaciones y Seguridad](#5-validaciones-y-seguridad)
6. [Dashboard y Reportes](#6-dashboard-y-reportes)

---

## 1. Crear Lista de SharePoint

### Paso 1.1: Crear la Lista

1. Ve a tu sitio de SharePoint
2. Click en **"Nuevo"** → **"Lista"**
3. Nombre: **"Capturas Airsoft"**
4. Descripción: **"Registro de capturas de bases del evento"**

### Paso 1.2: Agregar Columnas

Crea las siguientes columnas en la lista:

| Nombre Columna | Tipo | Requerido | Configuración |
|----------------|------|-----------|---------------|
| **Title** | Texto (default) | Sí | Renombrar a "ID Captura" |
| **Equipo** | Elección | Sí | Opciones: India, Pakistan |
| **DeviceID** | Texto | Sí | Longitud: 255 |
| **Timestamp** | Fecha y Hora | Sí | Incluir hora |
| **UserAgent** | Texto (múltiples líneas) | No | Texto plano |
| **Latitud** | Número | No | Decimales: 5 (SharePoint límite) |
| **Longitud** | Número | No | Decimales: 5 (SharePoint límite) |
| **Precision** | Número | No | Decimales: 0 (metros enteros) |
| **Distancia** | Número | No | Metros hasta el evento |
| **IPAddress** | Texto | No | - |
| **Estado** | Elección | Sí | Opciones: Activa, Cooldown, Expirada |

### Paso 1.3: Vista por Defecto

Configura una vista con estas columnas visibles:
- ID Captura
- Equipo
- Timestamp
- DeviceID
- Distancia
- Estado

---

## 2. Crear Flow en Power Automate

### Paso 2.1: Crear Nuevo Flow

1. Ve a [Power Automate](https://make.powerautomate.com)
2. **"Crear"** → **"Flujo de nube automatizado"**
3. Nombre: **"API Captura Airsoft"**
4. Trigger: **"Cuando se recibe una solicitud HTTP"**

### Paso 2.2: Configurar Trigger HTTP

**Trigger: "Cuando se recibe una solicitud HTTP"**

**Esquema JSON del Body:**

```json
{
    "type": "object",
    "properties": {
        "team": {
            "type": "string",
            "enum": ["india", "pakistan"]
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
            "type": ["object", "null"],
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
    "required": ["team", "deviceId", "ts"]
}
```

### Paso 2.3: Agregar Acciones al Flow

**📊 Diagrama de Flujo Simplificado:**

```
┌─────────────────────────┐
│  Recibir HTTP Request   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ Inicializar Variables   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ Buscar capturas previas │
│ del mismo dispositivo   │
└───────────┬─────────────┘
            ↓
     ¿Encontró algo?
       /         \
     SÍ           NO (Primera captura)
      ↓            \
¿Pasaron 30 min?   \
   /      \         \
  NO      SÍ        |
   ↓       \        |
Rechazar   \       |
(429)       \      |
             ↓     ↓
        ┌────────────────┐
        │ Crear elemento │
        │  en SharePoint │
        └────────┬───────┘
                 ↓
        ┌────────────────┐
        │ Responder OK   │
        │     (200)      │
        └────────────────┘
```

#### Acción 1: Inicializar Variables

**Variable: varCooldownMinutos** (Integer)
- Valor: `30`

**Variable: varEquipoCapitalizado** (String)
- **Valor:** Click en el icono de rayo ⚡ y pega:
  ```
  if(equals(triggerBody()?['team'], 'india'), 'India', 'Pakistan')
  ```
- **¿Qué hace?** Convierte "india" → "India" y "pakistan" → "Pakistan" (con mayúscula)

**Variable: varDeviceID** (String)
- **Valor:** Click en el icono de rayo ⚡ y pega:
  ```
  triggerBody()?['deviceId']
  ```
- **¿Qué hace?** Guarda el ID del celular que está capturando

**Variable: varLatitud** (Float)
- **Valor:** Click en el icono de rayo ⚡ y pega:
  ```
  triggerBody()?['location']?['lat']
  ```
- **¿Qué hace?** Extrae la latitud del GPS (ejemplo: -32.83114)

**Variable: varLongitud** (Float)
- **Valor:** Click en el icono de rayo ⚡ y pega:
  ```
  triggerBody()?['location']?['lng']
  ```
- **¿Qué hace?** Extrae la longitud del GPS (ejemplo: -60.70558)

**Variable: varPrecision** (Float)
- **Valor:** Click en el icono de rayo ⚡ y pega:
  ```
  triggerBody()?['location']?['accuracy']
  ```
- **¿Qué hace?** Guarda la precisión del GPS en metros (ejemplo: 10)

#### Acción 2: Obtener Elementos (Buscar capturas previas)

**Agregar acción:** Obtener elementos (Get items) de SharePoint

**Configuración paso a paso:**

1. **Dirección del sitio:** Selecciona tu sitio de SharePoint
2. **Nombre de lista:** Selecciona "Capturas Airsoft"
3. **Filtrar consulta (Filter Query):** Click en "Mostrar opciones avanzadas" y pega:
   ```
   field_2 eq '@{variables('varDeviceID')}' and field_1 eq '@{variables('varEquipoCapitalizado')}'
   ```
   **⚠️ IMPORTANTE:** Usa `field_2` y `field_1` en lugar de `DeviceID` y `Equipo` porque SharePoint usa nombres internos.
   
   **Si prefieres usar los nombres de display (puede fallar):**
   ```
   DeviceID eq '@{variables('varDeviceID')}' and Equipo eq '@{variables('varEquipoCapitalizado')}'
   ```
   **¿Qué hace?** Busca si este celular ya capturó antes para este equipo
   
4. **Ordenar por (Order By):** Escribe `field_3 desc` 
   **⚠️ IMPORTANTE:** Usa `field_3` en lugar de `Timestamp` porque SharePoint usa nombres internos.
   
   **Si prefieres usar el nombre de display (puede fallar):**
   ```
   Timestamp desc
   ```
   **¿Qué hace?** Ordena de más reciente a más antigua
   
5. **Máximo superior (Top Count):** Escribe `1`
   **¿Qué hace?** Solo trae la captura más reciente (la última)

**📝 Nota:** Esta acción puede devolver:
- **Lista vacía** = Primera captura de este dispositivo
- **1 elemento** = Ya capturó antes, revisar si pasaron 30 min

#### Acción 3: Condición - ¿Ya capturó antes este dispositivo?

**Agregar acción:** Condición

**En el cuadro de la izquierda escribe:**
```
length(body('Obtener_elementos')?['value'])
```

**Selecciona:** `es mayor que`

**En el cuadro de la derecha escribe:** `0`

![Diagrama de Condición](https://i.imgur.com/ejemplo.png)

---

### 📌 RAMA IZQUIERDA: **SÍ** (El dispositivo ya capturó antes)

Necesitamos verificar si pasaron los 30 minutos.

#### Acción 3.1: Compose - Obtener Última Captura

**Agregar acción:** Redactar (Compose)

**Nombre:** `UltimaCaptura`

**⚠️ PROBLEMA COMÚN: Esta expresión puede fallar si el nombre de columna es diferente.**

**Entradas (OPCIÓN 1 - Estándar):**
```
first(body('Obtener_elementos')?['value'])?['Timestamp']
```

**⚠️ PROBLEMA ENCONTRADO: SharePoint usa nombres internos como `field_3` en lugar de `Timestamp`**

**Entradas (OPCIÓN CORREGIDA - Usar el nombre interno):**
```
first(body('Obtener_elementos')?['value'])?['field_3']
```

**🔍 EXPLICACIÓN DEL PROBLEMA:**
SharePoint asigna nombres internos automáticamente a las columnas personalizadas:
- `field_1` = Columna "Equipo" 
- `field_2` = Columna "DeviceID"
- `field_3` = Columna "Timestamp" ← **Esta es la que necesitas**
- `field_4` = Columna "UserAgent"
- etc.

**Entradas (OPCIÓN 2 - Más robusta con múltiples nombres):**
```
coalesce(
  first(body('Obtener_elementos')?['value'])?['field_3'],
  first(body('Obtener_elementos')?['value'])?['Timestamp'],
  first(body('Obtener_elementos')?['value'])?['Created'],
  first(body('Obtener_elementos')?['value'])?['Modified']
)
```

**Entradas (OPCIÓN 3 - Para debugging):**
```
first(body('Obtener_elementos')?['value'])
```

**🔍 DEBUGGING: Primero usa la OPCIÓN 3** para ver la estructura completa del elemento devuelto. Esto te mostrará todos los campos disponibles y sus nombres exactos.

**Nombres posibles de la columna de fecha en SharePoint:**
- `Timestamp` (si así la nombraste)
- `Created` (fecha de creación automática)
- `Modified` (fecha de modificación automática)
- `Timestamp0` (si SharePoint renombró la columna)

#### Acción 3.2: Compose - Calcular Minutos Transcurridos

**Agregar acción:** Redactar (Compose)

**Nombre:** `MinutosTranscurridos`

**Entradas:**
```
if(
  equals(outputs('UltimaCaptura'), null),
  999999,
  div(sub(ticks(utcNow()), ticks(outputs('UltimaCaptura'))), 600000000)
)
```

**Explicación:** 
- Primero verifica si `UltimaCaptura` es `null` (no debería pasar en esta rama, pero por seguridad)
- Si es `null`, devuelve un número muy alto (999999 minutos) para que siempre pase el cooldown
- Si no es `null`, calcula los minutos transcurridos desde la última captura

**🔧 Alternativa más robusta (recomendada):**
```
div(sub(ticks(utcNow()), ticks(coalesce(outputs('UltimaCaptura'), '1900-01-01T00:00:00.000Z'))), 600000000)
```
Esta versión usa `coalesce()` para proporcionar una fecha muy antigua si `UltimaCaptura` es `null`.

#### Acción 3.3: Condición - ¿Cooldown todavía activo?

**Agregar acción:** Condición

**En el cuadro de la izquierda:**
```
outputs('MinutosTranscurridos')
```

**Selecciona:** `es menor que`

**En el cuadro de la derecha:**
```
variables('varCooldownMinutos')
```

---

### 📌 RAMA IZQUIERDA (dentro de esta condición): **SÍ** (Cooldown activo - Rechazar)

El jugador intentó capturar muy pronto. Debemos rechazarlo.

#### Acción: Responder - Rechazar por Cooldown

**Agregar acción:** Respuesta (Response)

**Código de estado:** `429`

**Cuerpo:**
```json
{
  "success": false,
  "error": "Cooldown activo",
  "remainingMinutes": @{sub(variables('varCooldownMinutos'), outputs('MinutosTranscurridos'))},
  "message": "Debes esperar @{sub(variables('varCooldownMinutos'), outputs('MinutosTranscurridos'))} minutos más"
}
```

**⚠️ IMPORTANTE:** Esta es una acción **TERMINAL**. El Flow termina aquí y no continúa.

---

### 📌 RAMA DERECHA: **NO** (Cooldown expirado - Permitir captura)

Los 30 minutos ya pasaron, puede capturar nuevamente. **No agregues nada aquí**, el Flow continúa automáticamente al siguiente paso fuera de las condiciones.

---

### 📌 RAMA DERECHA (de la primera condición): **NO** (Primera captura de este dispositivo)

Es la primera vez que este dispositivo captura. **No agregues nada aquí**, el Flow continúa automáticamente.

#### Acción 4: Crear Elemento en SharePoint

**Acción:** Create item (SharePoint)

- **Sitio:** [Tu sitio de SharePoint]
- **Lista:** Capturas Airsoft
- **Campos:**
  - **Title (ID Captura):** `@{guid()}`
  - **Equipo:** `@{variables('varEquipoCapitalizado')}`
  - **DeviceID:** `@{variables('varDeviceID')}`
  - **Timestamp:** `@{triggerBody()?['ts']}`
  - **UserAgent:** `@{triggerBody()?['userAgent']}`
  - **Latitud:** `@{variables('varLatitud')}`
  - **Longitud:** `@{variables('varLongitud')}`
  - **Precision:** `@{variables('varPrecision')}`
  - **Estado:** `Activa`

**📝 NOTA IMPORTANTE:** En la acción "Create item", Power Automate **SÍ** te muestra los nombres de columnas correctos (Equipo, DeviceID, etc.) en lugar de los nombres internos (field_1, field_2). Solo en "Get items" usa los nombres internos.

#### Acción 5: Respuesta Exitosa

**Acción:** Responder a una solicitud HTTP

- **Código de estado:** 200
- **Cuerpo:**
  ```json
  {
    "success": true,
    "message": "Base capturada correctamente",
    "team": "@{triggerBody()?['team']}",
    "captureId": "@{outputs('Crear_elemento')?['body']?['ID']}",
    "points": 100,
    "timestamp": "@{utcNow()}"
  }
  ```

### Paso 2.4: Guardar y Obtener URL

1. **Guardar** el Flow
2. Click en **"Cuando se recibe una solicitud HTTP"**
3. **Copiar la URL HTTP POST** que se genera
4. Ejemplo: `https://prod-XX.eastus.logic.azure.com:443/workflows/abc123.../triggers/manual/paths/invoke?...`

---

## 3. Configurar Endpoint

### Opción A: URL Directa (Desarrollo)

En `app.js`, busca la función `sendCapture()` y actualiza:

```javascript
async function sendCapture(team, deviceId, timestamp, userAgent) {
    const payload = {
        team,
        ts: timestamp,
        deviceId,
        userAgent,
        location: userLocation
    };

    // URL de tu Flow de Power Automate
    const apiUrl = 'https://prod-XX.eastus.logic.azure.com:443/workflows/abc123.../triggers/manual/paths/invoke?...';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Captura enviada exitosamente', data);
            return true;
        } else {
            console.warn('⚠️ Error en captura:', data);
            queueFailedEvent(payload);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
        queueFailedEvent(payload);
        return false;
    }
}
```

### Opción B: Archivo de Configuración (Producción)

1. Crea `config.json` (no subir a Git):

```json
{
    "apiEndpoint": "https://prod-XX.eastus.logic.azure.com:443/workflows/...",
    "cooldownMinutes": 30
}
```

2. Actualiza `app.js`:

```javascript
let API_CONFIG = null;

// Cargar configuración al inicio
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        API_CONFIG = await response.json();
    } catch (error) {
        console.error('Error cargando config:', error);
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    // ... resto del código
});
```

---

## 4. Actualizar Frontend

### Actualizar `config.example.json`

```json
{
    "apiEndpoint": "https://prod-XX.eastus.logic.azure.com:443/workflows/YOUR_FLOW_ID/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIGNATURE",
    "cooldownMinutes": 30,
    "eventLocation": {
        "lat": -32.8311426,
        "lng": -60.7055789,
        "name": "Rosario, Argentina"
    },
    "powerAutomateConfig": {
        "retryAttempts": 3,
        "retryDelay": 5000,
        "timeout": 30000
    }
}
```

### Agregar README con Instrucciones

Actualiza `README.md` con:

```markdown
## 🔷 Configuración con Power Automate

1. Copia `config.example.json` a `config.json`
2. Pega la URL de tu Flow en `apiEndpoint`
3. No subas `config.json` a Git (ya está en .gitignore)
```

---

## 5. Validaciones y Seguridad

### 🎯 Nota Importante: Precisión de Coordenadas

**SharePoint limita las columnas numéricas a 5 decimales.** El código frontend ya está configurado para redondear automáticamente:

```javascript
// En app.js - sendCapture()
location: userLocation ? {
    lat: parseFloat(userLocation.lat.toFixed(5)),   // Redondeo a 5 decimales
    lng: parseFloat(userLocation.lng.toFixed(5)),   // Redondeo a 5 decimales
    accuracy: Math.round(userLocation.accuracy)     // Metros enteros
} : null
```

**Precisión real:**
- 5 decimales = **~1.1 metros de precisión**
- Suficiente para eventos de Airsoft
- Ejemplo: `-32.83114, -60.70558`

Si necesitas más precisión:
- Usa **columnas de texto** en SharePoint
- O almacena en **Azure Table Storage** o **Dataverse**

### 5.1 Agregar Validación de IP (Opcional)

En Power Automate, agrega antes de crear el elemento:

**Acción: Compose - Obtener IP**
```
@{triggerOutputs()?['headers']?['X-Forwarded-For']}
```

**Guardar en SharePoint:**
- Campo **IPAddress:** `@{outputs('Obtener_IP')}`

### 5.2 Validación de Distancia

**Acción: Calcular Distancia (Opcional)**

Si quieres validar que el jugador esté cerca:

**Variable: varEventLat** = `-32.8311426`
**Variable: varEventLng** = `-60.7055789`

**Expresión (fórmula de Haversine simplificada):**
```
// Esto es complejo en Power Automate, mejor hacerlo en el frontend
// y enviar la distancia calculada en el payload
```

**Solución recomendada:** Calcular distancia en `app.js` y enviarla:

```javascript
// En app.js
const distance = userLocation ? calculateDistance(
    userLocation.lat, userLocation.lng,
    EVENT_LOCATION.lat, EVENT_LOCATION.lng
) : null;

const payload = {
    team,
    ts: timestamp,
    deviceId,
    userAgent,
    location: userLocation,
    distance: distance ? Math.round(distance) : null
};
```

Luego en SharePoint agregar columna **Distancia** (Número).

### 5.3 Actualizar Estados

**Flow Secundario: "Actualizar Estados Cooldown"**

Crear un Flow programado que se ejecute cada hora:

1. **Trigger:** Recurrence (cada 1 hora)
2. **Get items:** Estado = "Activa"
3. **Apply to each:**
   - **Condición:** Timestamp + 30 minutos < Ahora
   - **Update item:** Estado = "Expirada"

---

## 6. Dashboard y Reportes

### 6.1 Vista de Marcador

En SharePoint, crea una vista **"Marcador Actual"**:

**Filtro:**
```
Estado eq "Activa" or Estado eq "Cooldown"
```

**Agrupar por:** Equipo

**Columnas visibles:**
- Equipo
- Timestamp
- Distancia

### 6.2 Power BI Dashboard

**Conectar Power BI a SharePoint:**

1. Abre Power BI Desktop
2. **Obtener datos** → **SharePoint Online List**
3. URL del sitio: `https://tuempresa.sharepoint.com/sites/airsoft`
4. Selecciona la lista **"Capturas Airsoft"**

**Visualizaciones sugeridas:**

- **Tarjeta:** Total capturas India
- **Tarjeta:** Total capturas Pakistan
- **Gráfico de líneas:** Capturas por hora
- **Mapa:** Ubicación de las capturas (si hay GPS)
- **Tabla:** Últimas 10 capturas

### 6.3 Excel con Power Query

1. Abre Excel
2. **Datos** → **Obtener datos** → **Desde SharePoint**
3. Crea tablas dinámicas:
   - Capturas por equipo
   - Capturas por hora
   - Dispositivos únicos

---

## 7. Notificaciones en Tiempo Real

### 7.1 Agregar Notificación por Teams

En Power Automate, después de crear el elemento:

**Acción: Publicar mensaje en Teams**

- **Canal:** #airsoft-evento
- **Mensaje:**
  ```
  🎯 BASE CAPTURADA
  
  **Equipo:** @{variables('varEquipoCapitalizado')}
  **Hora:** @{convertFromUtc(utcNow(), 'Argentina Standard Time', 'g')}
  **Ubicación:** @{if(equals(variables('varLatitud'), null), 'No disponible', concat(variables('varLatitud'), ', ', variables('varLongitud')))}
  
  ¡El marcador se actualiza!
  ```

### 7.2 Notificación por Email

**Acción: Enviar correo electrónico (V2)**

- **Para:** admin@evento.com
- **Asunto:** `[Airsoft] Base capturada - @{variables('varEquipoCapitalizado')}`
- **Cuerpo:**
  ```html
  <h2>Base Capturada</h2>
  <p><strong>Equipo:</strong> @{variables('varEquipoCapitalizado')}</p>
  <p><strong>Timestamp:</strong> @{triggerBody()?['ts']}</p>
  <p><strong>Device ID:</strong> @{variables('varDeviceID')}</p>
  <p><strong>Coordenadas:</strong> @{variables('varLatitud')}, @{variables('varLongitud')}</p>
  ```

---

## 8. Testing

### Test Manual en Power Automate

1. Abre tu Flow
2. Click en **"Probar"** → **"Manualmente"**
3. Pega este JSON en el Body:

```json
{
    "team": "india",
    "ts": "2025-10-06T15:30:00.000Z",
    "deviceId": "test-device-12345",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    "location": {
        "lat": -32.8311426,
        "lng": -60.7055789,
        "accuracy": 10
    }
}
```

4. Verifica que se cree el elemento en SharePoint

### Test con Postman

1. Abre Postman
2. **POST** a tu URL del Flow
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
       "team": "pakistan",
       "ts": "2025-10-06T16:00:00.000Z",
       "deviceId": "test-device-67890",
       "userAgent": "Test User Agent",
       "location": {
           "lat": -32.8312000,
           "lng": -60.7056000,
           "accuracy": 15
       }
   }
   ```

---

## 9. Checklist de Implementación

- [ ] Lista de SharePoint creada con todas las columnas
- [ ] Flow de Power Automate configurado
- [ ] URL del endpoint copiada
- [ ] `config.json` creado con la URL
- [ ] `.gitignore` incluye `config.json`
- [ ] Test manual del Flow exitoso
- [ ] Test desde frontend exitoso
- [ ] Vista "Marcador Actual" creada
- [ ] Notificaciones configuradas (opcional)
- [ ] Dashboard en Power BI (opcional)

---

## 10. Troubleshooting

### Error: "Flow no recibe datos"

- Verifica que el esquema JSON del trigger sea correcto
- Comprueba que la URL no haya expirado
- Revisa los Headers del request

### Error: "No se crea el elemento en SharePoint"

- Verifica permisos en la lista
- Comprueba que los nombres de columnas coincidan exactamente
- Revisa que los tipos de datos sean compatibles

### Error: "Cooldown no funciona"

- Verifica la consulta de filtro en "Get items"
- Comprueba que el campo Timestamp esté en formato ISO
- Revisa la expresión de cálculo de minutos

### ❌ Error: "UltimaCaptura viene vacío" y "The template language function 'ticks' expects a string timestamp. The provided value is null"

**Problema:** La acción `UltimaCaptura` devuelve `null` cuando intenta obtener el timestamp de SharePoint.

**Causas más comunes:**
1. **Nombre de columna incorrecto:** El campo `Timestamp` no existe o tiene otro nombre
2. **Campo vacío:** El elemento existe pero el campo fecha está vacío
3. **Estructura JSON diferente:** SharePoint devuelve la fecha con otro formato
4. **Consulta no devuelve resultados:** `Obtener_elementos` está vacío

**🔍 PASO 1: DEBUGGING OBLIGATORIO**

Antes que nada, **modifica temporalmente** la acción `UltimaCaptura` para usar:
```
first(body('Obtener_elementos')?['value'])
```

Esto te mostrará **toda la estructura** del elemento devuelto. Ejecuta el Flow y verás algo como:
```json
{
  "ID": 1,
  "Title": "abc-123",
  "Equipo": "India",
  "DeviceID": "test-device",
  "Timestamp": "2025-10-06T15:30:00Z",
  "Created": "2025-10-06T15:30:15Z",
  "Modified": "2025-10-06T15:30:15Z",
  "AuthorId": 10
}
```

**🔍 PASO 2: IDENTIFICAR EL CAMPO CORRECTO**

Busca en la respuesta del paso anterior cuál es el **nombre exacto** del campo de fecha:
- ¿Aparece `"Timestamp"`? → Usa `['Timestamp']`
- ¿Aparece `"Created"`? → Usa `['Created']`
- ¿Aparece `"Timestamp0"`? → Usa `['Timestamp0']`
- ¿No aparece ningún timestamp? → El elemento no tiene fecha

**🔧 SOLUCIONES POR ORDEN DE PREFERENCIA:**

**Solución A: Usar el nombre correcto encontrado**
Si encontraste que el campo se llama `Created` en lugar de `Timestamp`:
```
first(body('Obtener_elementos')?['value'])?['Created']
```

**Solución B: Fórmula robusta con múltiples opciones**
```
coalesce(
  first(body('Obtener_elementos')?['value'])?['Timestamp'],
  first(body('Obtener_elementos')?['value'])?['Created'],
  first(body('Obtener_elementos')?['value'])?['Modified']
)
```

**Solución C: Verificar que existan elementos**
Si `Obtener_elementos` está devolviendo lista vacía, agrega esta condición antes:
```
if(
  greater(length(body('Obtener_elementos')?['value']), 0),
  first(body('Obtener_elementos')?['value'])?['Timestamp'],
  null
)
```

**🔧 SOLUCIÓN DEFINITIVA PARA MinutosTranscurridos:**

Una vez identificado el problema en `UltimaCaptura`, actualiza `MinutosTranscurridos`:
```
if(
  or(
    equals(outputs('UltimaCaptura'), null),
    equals(outputs('UltimaCaptura'), '')
  ),
  999999,
  div(sub(ticks(utcNow()), ticks(outputs('UltimaCaptura'))), 600000000)
)
```

### 🔍 **TABLA DE MAPEO DE CAMPOS SHAREPOINT**

**PROBLEMA IDENTIFICADO:** SharePoint usa nombres internos en las consultas. Aquí está el mapeo correcto:

| Nombre de Columna | Nombre Interno SharePoint | Usar en Consultas | Usar en Create Item |
|-------------------|---------------------------|-------------------|-------------------|
| **Equipo** | `field_1` | ✅ `field_1` | ✅ `Equipo` |
| **DeviceID** | `field_2` | ✅ `field_2` | ✅ `DeviceID` |
| **Timestamp** | `field_3` | ✅ `field_3` | ✅ `Timestamp` |
| **UserAgent** | `field_4` | ✅ `field_4` | ✅ `UserAgent` |
| **Latitud** | `field_5` | ✅ `field_5` | ✅ `Latitud` |
| **Longitud** | `field_6` | ✅ `field_6` | ✅ `Longitud` |
| **Precision** | `field_7` | ✅ `field_7` | ✅ `Precision` |
| **Estado** | `field_10` | ✅ `field_10` | ✅ `Estado` |

**📋 RESUMEN DE CAMBIOS NECESARIOS:**

1. **En UltimaCaptura:** Usar `['field_3']` en lugar de `['Timestamp']`
2. **En Filter Query:** Usar `field_2 eq '...' and field_1 eq '...'`
3. **En Order By:** Usar `field_3 desc`
4. **En Create Item:** Mantener los nombres normales (Equipo, DeviceID, etc.)

**� VERIFICACIÓN ADICIONAL:**

Si el problema persiste, verifica también:
1. **Permisos:** ¿Puede Power Automate leer la lista de SharePoint?
2. **Datos de prueba:** ¿Existe al menos un elemento en SharePoint para ese dispositivo?
3. **Filtro correcto:** ¿La consulta `DeviceID eq '@{variables('varDeviceID')}'` está funcionando?

**⚡ QUICK FIX TEMPORAL:**

Si necesitas que funcione YA mientras debuggeas, usa esto en `MinutosTranscurridos`:
```
999999
```
Esto hará que siempre permita la captura (cooldown siempre expirado).

### ❌ Error: "Consulta de SharePoint no devuelve elementos"

**Problema:** `Obtener_elementos` devuelve lista vacía aunque deberían existir capturas previas.

**Debugging paso a paso:**

1. **Verifica la consulta manualmente en SharePoint:**
   - Ve a tu lista "Capturas Airsoft"
   - Busca elementos que tengan el mismo `DeviceID` y `Equipo`
   - ¿Existen? Si no, el dispositivo nunca capturó antes

2. **Verifica nombres exactos de columnas:**
   - En SharePoint: Configuración → Configuración de lista → Columnas
   - Asegúrate que las columnas se llamen **exactamente** `DeviceID` y `Equipo`
   - Si tienen nombres diferentes, actualiza la consulta

3. **Testa la consulta desde Power Automate:**
   - Agrega una acción `Compose` temporal después de `Obtener_elementos`:
   ```
   {
     "TotalElementos": "@{length(body('Obtener_elementos')?['value'])}",
     "DeviceIDBuscado": "@{variables('varDeviceID')}",
     "EquipoBuscado": "@{variables('varEquipoCapitalizado')}",
     "TodosLosElementos": "@{body('Obtener_elementos')?['value']}"
   }
   ```

4. **Problema común: Filtro con caracteres especiales**
   Si el `DeviceID` tiene caracteres especiales, escápalos:
   ```
   DeviceID eq '@{replace(variables('varDeviceID'), "'", "''")}'
   ```
  "TotalElementos": "@{length(body('Obtener_elementos')?['value'])}"
}
```
Ejecuta el Flow y revisa qué devuelve esta acción para identificar el problema.

### Error CORS en el navegador

Power Automate HTTP triggers **no tienen problemas de CORS** por defecto, pero si aparece:
- Usa `mode: 'no-cors'` en el fetch (pero no podrás leer la respuesta)
- O implementa un proxy intermedio

---

## 📊 Arquitectura Final

```
[Móvil Jugador]
    ↓ (Escanea QR)
[GitHub Pages - index.html]
    ↓ (GPS + Mini-juego)
[Power Automate - HTTP Trigger]
    ↓ (Validación Cooldown)
[SharePoint List - Capturas Airsoft]
    ↓ (Consulta en tiempo real)
[Power BI Dashboard / Excel / Teams]
```

---

¡Tu backend con Power Automate está listo! 🔷✨

**Ventajas de esta solución:**
- ✅ Sin servidores que mantener
- ✅ Integración nativa con Microsoft 365
- ✅ Fácil de auditar y reportar
- ✅ Escalable automáticamente
- ✅ Seguro (autenticación de Microsoft)
- ✅ Notificaciones integradas

**Próximos pasos:**
1. Implementar el Flow siguiendo esta guía
2. Copiar la URL del endpoint
3. Actualizar `config.json`
4. ¡Probar en el evento! 🎯
