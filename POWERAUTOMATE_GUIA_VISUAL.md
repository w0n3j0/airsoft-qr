# 📸 Guía Visual de Power Automate - Paso a Paso

Esta guía complementa `BACKEND_POWERAUTOMATE.md` con ejemplos visuales y capturas descriptivas.

## 🎬 Tutorial en Video (Recomendado)

Si prefieres ver un video mientras sigues los pasos: [Tutorial Power Automate + SharePoint](https://www.youtube.com/results?search_query=power+automate+http+trigger+sharepoint)

---

## 📋 PARTE 1: Crear la Lista de SharePoint

### Paso 1: Ir a SharePoint

```
https://tuempresa.sharepoint.com/sites/tu-sitio
```

### Paso 2: Crear Nueva Lista

```
┌─────────────────────────────────────┐
│  + Nuevo  ▼                         │
├─────────────────────────────────────┤
│  Lista                              │ ← Click aquí
│  Documento                          │
│  Carpeta                            │
└─────────────────────────────────────┘
```

### Paso 3: Nombrar la Lista

```
┌───────────────────────────────────────┐
│  Crear una lista                      │
├───────────────────────────────────────┤
│  Nombre: Capturas Airsoft             │
│                                       │
│  Descripción: Registro de capturas   │
│               del evento Airsoft      │
│                                       │
│     [Cancelar]        [Crear] ←Click │
└───────────────────────────────────────┘
```

### Paso 4: Agregar Columnas

**Click en "+ Agregar columna"** (arriba a la derecha)

#### Columna 1: Equipo
```
Tipo: Elección
Nombre: Equipo
Opciones:
  - India
  - Pakistan
Requerido: ✅ Sí
```

#### Columna 2: DeviceID
```
Tipo: Una sola línea de texto
Nombre: DeviceID
Requerido: ✅ Sí
```

#### Columna 3: Timestamp
```
Tipo: Fecha y hora
Nombre: Timestamp
Incluir hora: ✅ Sí
Requerido: ✅ Sí
```

#### Columna 4: Latitud
```
Tipo: Número
Nombre: Latitud
Decimales: 5
Requerido: ❌ No
```

#### Columna 5: Longitud
```
Tipo: Número
Nombre: Longitud
Decimales: 5
Requerido: ❌ No
```

#### Columna 6: Precision
```
Tipo: Número
Nombre: Precision
Decimales: 0
Requerido: ❌ No
```

#### Columna 7: Estado
```
Tipo: Elección
Nombre: Estado
Opciones:
  - Activa
  - Cooldown
  - Expirada
Por defecto: Activa
Requerido: ✅ Sí
```

#### Columna 8: UserAgent
```
Tipo: Varias líneas de texto
Nombre: UserAgent
Requerido: ❌ No
```

---

## ⚡ PARTE 2: Crear el Flow en Power Automate

### Paso 1: Ir a Power Automate

```
https://make.powerautomate.com
```

### Paso 2: Crear Flujo Automatizado

```
┌─────────────────────────────────────┐
│  + Crear                            │
├─────────────────────────────────────┤
│  Flujo de nube automatizado    ← ⚡  │
│  Flujo de nube instantáneo          │
│  Flujo de nube programado           │
└─────────────────────────────────────┘
```

### Paso 3: Configurar Nombre y Trigger

```
┌──────────────────────────────────────────┐
│  Crear un flujo automatizado             │
├──────────────────────────────────────────┤
│  Nombre del flujo:                       │
│  API Captura Airsoft                     │
│                                          │
│  Elegir el desencadenador del flujo:     │
│  🔍 [Buscar todos los desencadenadores]  │
│                                          │
│  Busca: "http"                           │
│                                          │
│  📩 Cuando se recibe una solicitud  ← ✓  │
│     HTTP                                 │
│                                          │
│         [Omitir]        [Crear] ← Click  │
└──────────────────────────────────────────┘
```

---

## 🔧 PARTE 3: Configurar el Trigger HTTP

### Visual del Trigger

```
╔═══════════════════════════════════════════╗
║  Cuando se recibe una solicitud HTTP      ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Método: POST                             ║
║                                           ║
║  📋 Usar una carga de ejemplo para...    ║ ← Click aquí
║                                           ║
║  [Mostrar opciones avanzadas]             ║
║                                           ║
╚═══════════════════════════════════════════╝
```

### Pegar este JSON en "Carga de ejemplo"

```json
{
    "team": "india",
    "ts": "2025-10-06T15:30:00.000Z",
    "deviceId": "abc123-def456-ghi789",
    "userAgent": "Mozilla/5.0 (iPhone...)",
    "location": {
        "lat": -32.83114,
        "lng": -60.70558,
        "accuracy": 10
    }
}
```

**Click en "Listo"** y Power Automate genera automáticamente el esquema.

---

## 📊 PARTE 4: Agregar Variables

### Cómo agregar una variable

```
Click en "+ Nuevo paso"
    ↓
Busca: "inicializar variable"
    ↓
Selecciona: "Inicializar variable"
```

### Variable 1: varCooldownMinutos

```
╔═══════════════════════════════════════════╗
║  Inicializar variable                     ║
╠═══════════════════════════════════════════╣
║  Nombre: varCooldownMinutos               ║
║  Tipo: [Entero ▼]                         ║
║  Valor: 30                                ║
╚═══════════════════════════════════════════╝
```

### Variable 2: varEquipoCapitalizado

```
╔═══════════════════════════════════════════╗
║  Inicializar variable                     ║
╠═══════════════════════════════════════════╣
║  Nombre: varEquipoCapitalizado            ║
║  Tipo: [Cadena ▼]                         ║
║  Valor: ⚡ [Click en el rayo]             ║
║                                           ║
║  if(equals(triggerBody()?['team'],        ║
║     'india'), 'India', 'Pakistan')        ║
╚═══════════════════════════════════════════╝
```

**⚡ Icono del rayo** = Expresión dinámica

### Variable 3: varDeviceID

```
╔═══════════════════════════════════════════╗
║  Inicializar variable                     ║
╠═══════════════════════════════════════════╣
║  Nombre: varDeviceID                      ║
║  Tipo: [Cadena ▼]                         ║
║  Valor: ⚡ triggerBody()?['deviceId']     ║
╚═══════════════════════════════════════════╝
```

### Variables 4, 5, 6: Coordenadas GPS

Repite el mismo proceso para:

**varLatitud** (Float):
```
triggerBody()?['location']?['lat']
```

**varLongitud** (Float):
```
triggerBody()?['location']?['lng']
```

**varPrecision** (Float):
```
triggerBody()?['location']?['accuracy']
```

---

## 🔍 PARTE 5: Obtener Elementos de SharePoint

### Visual de la Acción

```
╔═══════════════════════════════════════════╗
║  Obtener elementos                        ║
╠═══════════════════════════════════════════╣
║  Dirección del sitio: [Seleccionar ▼]    ║
║  📁 https://tuempresa.sharepoint.com/...  ║
║                                           ║
║  Nombre de lista: [Capturas Airsoft ▼]   ║
║                                           ║
║  [Mostrar opciones avanzadas] ← Click     ║
╚═══════════════════════════════════════════╝
```

### Opciones Avanzadas

```
╔═══════════════════════════════════════════╗
║  Filtrar consulta:                        ║
║  DeviceID eq '@{variables('varDeviceID'   ║
║  ')}' and Equipo eq '@{variables('var     ║
║  EquipoCapitalizado')}'                   ║
║                                           ║
║  Ordenar por:                             ║
║  Timestamp desc                           ║
║                                           ║
║  Máximo superior:                         ║
║  1                                        ║
╚═══════════════════════════════════════════╝
```

**💡 Tip:** Copia y pega la consulta de filtro completa, no la escribas a mano.

---

## 🔀 PARTE 6: Las Condiciones (El Parte Más Importante)

### Condición 1: ¿Ya capturó antes?

```
+ Nuevo paso → Busca: "condición" → Selecciona "Condición"
```

#### Visual de la Condición

```
╔═══════════════════════════════════════════════════════╗
║  Condición                                            ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  [Elegir un valor]  [es mayor que ▼]  [Elegir...]    ║
║         ↓                                      ↓      ║
║  Click y escribe:                            Click    ║
║  length(body('Obtener_elementos')?...        y escr:  ║
║                                              0        ║
║                                                       ║
║  ┌────────────────┐   ┌────────────────┐             ║
║  │      Sí        │   │       No       │             ║
║  │                │   │                │             ║
║  │  Ya capturó    │   │  Primera vez   │             ║
║  │  antes         │   │  (continúa)    │             ║
║  └────────────────┘   └────────────────┘             ║
╚═══════════════════════════════════════════════════════╝
```

### Dentro del "Sí": Calcular Minutos

#### Acción: Compose - UltimaCaptura

```
+ Agregar una acción (dentro del SÍ)
Busca: "redactar" o "compose"
```

```
╔═══════════════════════════════════════════╗
║  Redactar                                 ║
╠═══════════════════════════════════════════╣
║  Entradas: ⚡                             ║
║                                           ║
║  first(body('Obtener_elementos')          ║
║       ?['value'])?['Timestamp']           ║
║                                           ║
║  [Cambiar nombre: UltimaCaptura]          ║
╚═══════════════════════════════════════════╝
```

#### Acción: Compose - MinutosTranscurridos

```
╔═══════════════════════════════════════════╗
║  Redactar                                 ║
╠═══════════════════════════════════════════╣
║  Entradas: ⚡                             ║
║                                           ║
║  div(sub(ticks(utcNow()),                 ║
║      ticks(outputs('UltimaCaptura'))),    ║
║      600000000)                           ║
║                                           ║
║  [Cambiar nombre: MinutosTranscurridos]   ║
╚═══════════════════════════════════════════╝
```

**🧮 ¿Qué hace?** Divide los "ticks" por 600000000 para convertir a minutos.

### Condición 2: ¿Cooldown activo?

```
+ Agregar una acción (después de MinutosTranscurridos)
Busca: "condición"
```

```
╔═══════════════════════════════════════════════════════╗
║  Condición                                            ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  [Elegir valor]  [es menor que ▼]  [Elegir valor]    ║
║       ↓                                    ↓          ║
║  outputs('MinutosTranscurridos')   variables('var... ║
║                                    CooldownMinutos')  ║
║                                                       ║
║  ┌──────────────────┐   ┌──────────────────┐         ║
║  │       Sí         │   │        No        │         ║
║  │                  │   │                  │         ║
║  │  Cooldown activo │   │  Ya pasaron      │         ║
║  │  RECHAZAR (429)  │   │  30 minutos      │         ║
║  └──────────────────┘   │  (continúa)      │         ║
║                         └──────────────────┘         ║
╚═══════════════════════════════════════════════════════╝
```

### Dentro del "Sí": Rechazar

```
+ Agregar una acción
Busca: "respuesta" o "response"
```

```
╔═══════════════════════════════════════════╗
║  Respuesta                                ║
╠═══════════════════════════════════════════╣
║  Código de estado: 429                    ║
║                                           ║
║  Cuerpo: (pegar JSON abajo)               ║
║                                           ║
║  {                                        ║
║    "success": false,                      ║
║    "error": "Cooldown activo",            ║
║    "remainingMinutes": @{sub(             ║
║      variables('varCooldownMinutos'),     ║
║      outputs('MinutosTranscurridos')      ║
║    )}                                     ║
║  }                                        ║
╚═══════════════════════════════════════════╝
```

**⚠️ MUY IMPORTANTE:** Esta respuesta TERMINA el Flow. No agregues nada después.

---

## ✅ PARTE 7: Crear Elemento en SharePoint

Esta acción va **FUERA y DESPUÉS** de todas las condiciones.

```
+ Nuevo paso (al final del Flow)
Busca: "crear elemento" o "create item"
```

```
╔═══════════════════════════════════════════╗
║  Crear elemento                           ║
╠═══════════════════════════════════════════╣
║  Dirección del sitio: [Tu sitio]          ║
║  Nombre de lista: [Capturas Airsoft]      ║
║                                           ║
║  Title: ⚡ guid()                          ║
║  Equipo: ⚡ variables('varEquipoCapit...') ║
║  DeviceID: ⚡ variables('varDeviceID')     ║
║  Timestamp: ⚡ triggerBody()?['ts']        ║
║  UserAgent: ⚡ triggerBody()?['userAgent'] ║
║  Latitud: ⚡ variables('varLatitud')       ║
║  Longitud: ⚡ variables('varLongitud')     ║
║  Precision: ⚡ variables('varPrecision')   ║
║  Estado: Activa                           ║
╚═══════════════════════════════════════════╝
```

---

## 🎉 PARTE 8: Respuesta Exitosa

```
+ Nuevo paso (después de Crear elemento)
Busca: "respuesta"
```

```
╔═══════════════════════════════════════════╗
║  Respuesta                                ║
╠═══════════════════════════════════════════╣
║  Código de estado: 200                    ║
║                                           ║
║  Cuerpo:                                  ║
║  {                                        ║
║    "success": true,                       ║
║    "message": "Base capturada",           ║
║    "team": "@{triggerBody()?['team']}",   ║
║    "captureId": "@{outputs('Crear_ele...  ║
║                     mento')?['body']?...  ║
║                     ['ID']}"              ║
║  }                                        ║
╚═══════════════════════════════════════════╝
```

---

## 💾 PARTE 9: Guardar y Obtener URL

### Guardar el Flow

```
┌─────────────────────────────────┐
│  💾 Guardar  ← Click aquí       │
└─────────────────────────────────┘
```

Espera a que aparezca "Se guardó correctamente".

### Obtener la URL del Endpoint

1. Click en el trigger **"Cuando se recibe una solicitud HTTP"** (el primero)
2. Verás aparecer un campo con una URL larga
3. Click en el icono de **copiar** 📋

```
╔═══════════════════════════════════════════╗
║  Cuando se recibe una solicitud HTTP      ║
╠═══════════════════════════════════════════╣
║                                           ║
║  URL de HTTP POST                         ║
║  ┌─────────────────────────────────────┐ ║
║  │https://prod-12.eastus.logic.azure...│ ║
║  │...com:443/workflows/abc123/triggers/│ ║
║  │manual/paths/invoke?api-version=...  │📋║
║  └─────────────────────────────────────┘ ║
╚═══════════════════════════════════════════╝
```

**🎯 Esta URL es tu ENDPOINT.** Guárdala en un lugar seguro.

---

## 🧪 PARTE 10: Probar el Flow

### Test Rápido en Power Automate

```
1. Click en "Probar" (arriba a la derecha)
2. Selecciona "Manualmente"
3. Click en "Probar"
4. Te pedirá un JSON, pega:
```

```json
{
    "team": "india",
    "ts": "2025-10-06T15:30:00.000Z",
    "deviceId": "test-123",
    "userAgent": "Test",
    "location": {
        "lat": -32.83114,
        "lng": -60.70558,
        "accuracy": 10
    }
}
```

```
5. Click en "Ejecutar flujo"
6. Espera a que termine
7. ✅ Si todo está verde, ¡funciona!
```

### Verificar en SharePoint

```
1. Ve a tu lista "Capturas Airsoft"
2. Deberías ver un nuevo elemento:
   - Equipo: India
   - DeviceID: test-123
   - Timestamp: [La fecha actual]
```

---

## ❓ Problemas Comunes

### Error: "La expresión no es válida"

**Solución:** Asegúrate de hacer click en el ⚡ (rayo) antes de pegar expresiones.

### Error: "No se puede encontrar la lista"

**Solución:** Selecciona el sitio primero, luego espera a que cargue la lista.

### Error: "El elemento no se creó"

**Solución:** Verifica que los nombres de las columnas en SharePoint coincidan EXACTAMENTE:
- `Equipo` (no "Team" ni "equipo")
- `DeviceID` (no "Device_ID" ni "deviceId")
- `Timestamp` (no "Fecha" ni "Time")

### No aparece la URL del endpoint

**Solución:** Debes GUARDAR el Flow primero, luego volver a abrir el trigger HTTP.

---

## 🎓 Recursos Adicionales

**Videos Recomendados:**
- [Power Automate HTTP Trigger Basics](https://www.youtube.com/results?search_query=power+automate+http+trigger)
- [SharePoint List Integration](https://www.youtube.com/results?search_query=power+automate+sharepoint+create+item)

**Documentación Oficial:**
- [Power Automate Expressions Reference](https://learn.microsoft.com/en-us/power-automate/expressions-reference)
- [SharePoint Connector](https://learn.microsoft.com/en-us/connectors/sharepointonline/)

---

**¡Listo!** Ahora tienes tu backend funcionando con Power Automate y SharePoint. 🎉

**Siguiente paso:** Copia la URL del endpoint y pégala en `config.json` de tu frontend.
