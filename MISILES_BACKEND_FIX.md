# 🔧 Corrección del Backend de Misiles

## ⚠️ Problema Identificado

Tu backend de Power Automate está devolviendo una estructura incorrecta:

```json
{
    "statusCode": 200,
    "headers": {...},
    "body": {
        "value": [...]
    }
}
```

**Esto está MAL** porque el frontend espera solo el contenido, no todo el objeto HTTP.

---

## ✅ Solución: Modificar el Flow GET

### Paso 1: Ir al Flow de "Obtener Items" (GET)

El flow actual probablemente tiene esta configuración:

```
1. When a HTTP request is received (GET)
2. Get items from SharePoint (Lista: Misiles)
3. Response (return body from SharePoint)
```

### Paso 2: Cambiar la Respuesta

El paso 3 (Response) debe devolver **SOLO** el array `value`, no todo el objeto.

#### Configuración Correcta:

**Action:** Response  
**Status Code:** 200  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** (usar expresión)
```
body('Get_items')
```

O si ya tienes `body('Get_items')` y sigue devolviendo el objeto completo, usa:

```
outputs('Get_items')?['body']
```

---

## 📊 Respuesta Correcta Esperada

El endpoint GET debe devolver esto:

```json
{
    "value": [
        {
            "@odata.etag": "\"2\"",
            "ItemInternalId": "1",
            "ID": 1,
            "Title": "1",
            "field_1": "Armado",
            "field_4": 0,
            "field_5": 0,
            "field_6": 0,
            "Modified": "2025-10-07T19:40:45Z",
            "Created": "2025-10-07T19:39:36Z",
            ...
        },
        {
            "@odata.etag": "\"2\"",
            "ItemInternalId": "2",
            "ID": 2,
            "Title": "2",
            "field_1": "Armado",
            ...
        },
        {
            "@odata.etag": "\"2\"",
            "ItemInternalId": "3",
            "ID": 3,
            "Title": "3",
            "field_1": "Armado",
            ...
        }
    ]
}
```

---

## 🚨 Problema del POST (Error 400)

El POST está fallando con:
```json
{
  "error": "Misil inválido. Use 1, 2 o 3",
  "missile": "1"
}
```

### Causas Posibles:

1. **Validación incorrecta**: El backend valida el campo `missile` pero lo rechaza aunque sea "1"
2. **Comparación de tipos**: El backend compara `missile === 1` (number) pero recibe `"1"` (string)
3. **Schema del trigger**: El schema en Power Automate puede estar definido incorrectamente

### Solución:

#### Opción 1: Arreglar la Validación en Power Automate

En tu flow POST, busca el paso que hace la validación (probablemente un "Condition" o "Switch").

**Cambiar de:**
```
triggerBody()?['missile'] equals 1
```

**A:**
```
triggerBody()?['missile'] equals '1'
```

O usar una expresión que convierta a string:
```
string(triggerBody()?['missile'])
```

#### Opción 2: Verificar el Schema del Trigger

En el trigger "When a HTTP request is received", verifica que el schema NO tenga `missile` como `integer`:

**Schema Incorrecto:**
```json
{
    "type": "object",
    "properties": {
        "missile": {
            "type": "integer"  ❌ MAL
        },
        ...
    }
}
```

**Schema Correcto:**
```json
{
    "type": "object",
    "properties": {
        "missile": {
            "type": "string"  ✅ BIEN
        },
        "ts": {
            "type": "string"
        },
        "deviceId": {
            "type": "string"
        },
        "location": {
            "type": "object",
            "properties": {
                "lat": {"type": "number"},
                "lng": {"type": "number"},
                "accuracy": {"type": "number"}
            }
        }
    },
    "required": ["missile", "ts", "deviceId"]
}
```

---

## 🧪 Testing del Fix

Una vez que hayas corregido el backend GET, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File "test-endpoints.ps1"
```

Deberías ver:
```
TEST 1: Obtener estado de misiles (GET)
Respuesta exitosa! Status Code: 200

Respuesta:
{
    "value": [
        {
            "Title": "1",
            "field_1": "Armado",
            ...
        },
        ...
    ]
}

TEST 2: Desactivar Misil 1 (POST)
Misil desactivado! Status Code: 200
```

---

## 📝 Resumen de Cambios Necesarios

### En Power Automate:

1. **GET Flow**: Modificar el paso "Response" para devolver solo `outputs('Get_items')?['body']`
2. **POST Flow**: Cambiar validación para comparar strings: `triggerBody()?['missile'] equals '1'`
3. **POST Schema**: Asegurar que `missile` esté definido como `"type": "string"`

### En el Frontend (YA CORREGIDO):

- ✅ `metrics.html` - Actualizado para leer `Title` y `field_1`
- ✅ `misil.html` - Actualizado para buscar el misil correcto en el array
- ✅ `test-misiles.html` - Actualizado para mostrar correctamente los datos

---

## 🎯 Siguiente Paso

Una vez que corrijas el backend:

1. Guarda los cambios en Power Automate
2. Espera 1-2 minutos (caché)
3. Ejecuta el test: `test-endpoints.ps1`
4. Abre el navegador: `http://127.0.0.1:8080/test-misiles.html`
5. Prueba cada botón

¡Después de eso todo debería funcionar! 🚀
