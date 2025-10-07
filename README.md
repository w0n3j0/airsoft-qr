# 🎯 Airsoft QR - Sistema de Captura de Bases# 🎯 Sistema de Captura de Bases - Airsoft



Sistema web completo para eventos de Airsoft con captura de bases mediante QR, mini-juego interactivo, GPS tracking y cooldown automático.Sistema web estático para eventos de Airsoft con temática **India vs Pakistán**. Los ju- **Satelital**: Requiere API key de Mapbox o Google Maps



**Demo en Vivo:** https://w0n3j0.github.io/airsoft-qr/## 🔧 Configuración del Backend



## 🚀 Características Principales

- ✅ **Lectura de QR** para activar captura de base
- ✅ **Mini-juego interactivo** (conectar cables) para confirmar captura
- ✅ **GPS tracking** con animación de mapa táctica centrada
- ✅ **Cooldown de 60 minutos (1 hora)** por equipo/dispositivo
- ✅ **� Página de métricas en tiempo real** - [metrics.html](./metrics.html)
- ✅ **Integración con Power Automate** y SharePoint
- ✅ **Responsive design** optimizado para móviles
- ✅ **PWA-Ready** - Funciona offline y se puede instalar
- ✅ **Sin infraestructura** - Deploy en GitHub Pages
- ✅ **100% Frontend** - Sin servidores que mantener

## 📊 Página de Métricas

**Nueva funcionalidad:** Panel de control en tiempo real para monitorear el evento.

- **URL:** `https://w0n3j0.github.io/airsoft-qr/metrics.html`
- **Características:**
  - 🏆 Scoreboard India vs Pakistan
  - � **Panel de Estado de Misiles** (Objetivos Secundarios)
  - �📈 Estadísticas en tiempo real
  - 📋 Historial completo de capturas
  - 🔄 Auto-refresh cada 30 segundos
  - 📱 Responsive para móviles y tablets
- **Guía completa:** [`METRICS_GUIDE.md`](./METRICS_GUIDE.md)

## 🚀 Sistema de Misiles (Objetivos Secundarios)

**Nuevo:** Sistema independiente de 3 misiles que pueden ser desactivados durante el evento.

- **URL:** `https://w0n3j0.github.io/airsoft-qr/misil.html?missile=X` (donde X = 1, 2 o 3)
- **Características:**
  - 🎯 3 misiles independientes
  - 🔴 Estado: Armado / 🟢 Desactivado
  - ⚡ Desactivación instantánea (una sola vez)
  - 📍 Captura GPS de la ubicación
  - 📊 Visualización en tiempo real en métricas
  - 🎨 Diseño temático militar con animaciones
- **Guía de configuración:** [`MISILES_BACKEND.md`](./MISILES_BACKEND.md)

### 📋 Opciones de Implementación

1. **🔷 Power Automate + SharePoint** (Recomendado para Microsoft 365)
     - 📘 **Guía paso a paso:** [`BACKEND_POWERAUTOMATE.md`](./BACKEND_POWERAUTOMATE.md)
   - 📸 **Tutorial visual:** [`POWERAUTOMATE_GUIA_VISUAL.md`](./POWERAUTOMATE_GUIA_VISUAL.md) ← **¡Nuevo!**
   - ✅ Sin servidores, fácil implementación
   - ✅ Integración nativa con Teams y Power BI
   - ✅ Lista de SharePoint para almacenar capturas
   - ✅ Coordenadas redondeadas a 5 decimales (límite de SharePoint)

2. **🖥️ Servidor Tradicional** (Node.js, Python, PHP)

   - 📘 Ver guía completa: [`BACKEND.md`](./BACKEND.md)

## 🎮 Cómo Funciona   - Ejemplos de código incluidos



1. **Jugador escanea QR** del equipo contrario### 📤 Payload Enviado

2. **Animación GPS** muestra ubicación del objetivo (textos centrados)

3. **Mini-juego** - Conectar 3 cables correctamente (líneas precisas)El sitio envía un POST con el siguiente payload:es escanean códigos QR para acceder a un mini-juego que, al completarse, captura la base y envía los datos al sistema de puntuación.

4. **Captura exitosa** - Se envía a Power Automate

5. **Cooldown activado** - 60 minutos hasta próxima captura## 🚀 Características

6. **Datos guardados** en SharePoint

- **🎯 100% Optimizado para Móvil**: Diseñado exclusivamente para celulares con controles táctiles grandes

## 📦 Instalación Rápida- **📍 Animación GPS Espectacular**: Mapa táctico con zoom hacia las coordenadas del evento al escanear QR

- **🗺️ Mapa Real de Fondo**: Integración con OpenStreetMap mostrando la ubicación exacta del evento

### 1. Clonar y Configurar- **📍 Coordenadas Fijas**: Rosario, Argentina (-32.8311426, -60.7055789)

- **📏 Validación de Distancia**: Calcula distancia del jugador al objetivo

```bash- **🎮 Mini-juego Táctil**: Conectar cables en menos de 10 segundos con áreas táctiles optimizadas

git clone https://github.com/w0n3j0/airsoft-qr.git- **⏱️ Sistema de Cooldown**: Bloqueo de 60 minutos (1 hora) por dispositivo tras captura exitosa

cd airsoft-qr- **🔄 Reintentos Automáticos**: Cola de eventos con reintentos en caso de fallos de red

```- **🎨 Temática HUD Militar**: Animaciones de radar, mapa táctico y efectos visuales por bando

- **📦 Sin Dependencias**: Vanilla JS, ligero (< 80KB)

### 2. Configurar `config.json`- **📱 PWA-Ready**: Instalable en pantalla principal del móvil

- **🌍 Geolocalización**: Captura y envía ubicación GPS precisa de cada jugador

```json

{## 📁 Estructura del Proyecto

  "apiUrl": "TU_URL_DE_POWER_AUTOMATE_AQUI",

  "cooldownMinutes": 60,```

  "eventLocation": {airsoft-qr/

    "lat": -32.8311426,├── index.html              # Página principal

    "lng": -60.7055789,├── styles.css              # Estilos y animaciones

    "name": "Rosario, Argentina"├── app.js                  # Lógica del juego y API

  }├── manifest.json           # Manifest PWA

}├── config.example.json     # Ejemplo de configuración de API

```└── README.md              # Este archivo

```

### 3. Probar Localmente

## 🎮 Cómo Funciona

```bash

npx http-server -p 8080 -c-1 --cors### Flujo del Usuario

```

1. **Escanear QR**: El usuario escanea uno de los dos códigos QR (India o Pakistán)

Abrir: http://localhost:8080/?team=india2. **Acceder al juego**: Se carga la página con el tema del bando correspondiente

3. **Mini-juego**: Conectar 3 pares de cables arrastrando desde los pines izquierdos a los derechos

### 4. Deploy a GitHub Pages4. **Captura exitosa**: Al completar, aparece animación de "BASE CAPTURADA"

5. **Envío de datos**: POST al servidor con información de captura

```bash6. **Cooldown**: El dispositivo queda bloqueado 60 minutos para ese bando

git add .

git commit -m "Configure app"### URLs por Bando

git push origin main

```- **India**: `https://tu-usuario.github.io/airsoft-qr/?team=india`

- **Pakistán**: `https://tu-usuario.github.io/airsoft-qr/?team=pakistan`

Activar en: **Settings → Pages → Source: main**

## 📦 Despliegue en GitHub Pages

## 🔧 Power Automate Backend

### 1. Configurar el Repositorio

### Crear Lista en SharePoint

```bash

Columnas necesarias:# Si aún no tienes el repo iniciado

- **Equipo** (Choice): India, Pakistangit init

- **DeviceID** (Text)git add .

- **Timestamp** (Date/Time)git commit -m "Sistema de captura de bases completo"

- **Latitud** (Number, 5 decimales)git branch -M main

- **Longitud** (Number, 5 decimales)git remote add origin https://github.com/TU-USUARIO/airsoft-qr.git

- **Estado** (Choice): Activa, Cooldown, Expiradagit push -u origin main

```

### Crear Flow en Power Automate

### 2. Activar GitHub Pages

1. **Trigger:** "Cuando se recibe una solicitud HTTP"

2. **Esquema JSON:**1. Ve a tu repositorio en GitHub

```json2. Settings → Pages

{3. En **Source**, selecciona `main` branch y carpeta `/ (root)`

  "type": "object",4. Haz clic en **Save**

  "properties": {5. En unos minutos estará disponible en: `https://TU-USUARIO.github.io/NOMBRE-REPO/`

    "team": {"type": "string"},

    "ts": {"type": "string"},### 3. Configurar la API

    "deviceId": {"type": "string"},

    "userAgent": {"type": "string"},#### Opción A: En el HTML directamente

    "location": {

      "type": "object",Edita `index.html` y añade la URL en el atributo `data-api`:

      "properties": {

        "lat": {"type": "number"},```html

        "lng": {"type": "number"},<body data-api="https://tu-servidor.com/api/capture">

        "accuracy": {"type": "number"}```

      }

    }#### Opción B: Con archivo config.json

  }

}1. Copia `config.example.json` a `config.json`

```2. Edita el `apiUrl` con tu endpoint real

3. Modifica `app.js` para cargar la configuración (opcional, ya incluido básicamente)

3. **Validar cooldown** consultando SharePoint con `field_2` y `field_1`

4. **Guardar captura** si cooldown expiró**Nota**: Si usas `config.json`, asegúrate de añadirlo al `.gitignore` si contiene información sensible.

5. **Copiar URL** del endpoint y ponerla en `config.json`

## 🎨 Generar Códigos QR

### ⚠️ IMPORTANTE: SharePoint Field Mapping

Usa cualquier generador de QR con las siguientes URLs:

SharePoint usa nombres internos en consultas:

### Para el Bando India

| Display Name | Internal Name | En GET items | En CREATE item |```

|--------------|---------------|--------------|----------------|https://TU-USUARIO.github.io/airsoft-qr/?team=india

| Equipo       | field_1       | ✅ field_1   | ✅ Equipo     |```

| DeviceID     | field_2       | ✅ field_2   | ✅ DeviceID   |

| Timestamp    | field_3       | ✅ field_3   | ✅ Timestamp  |### Para el Bando Pakistán

| Latitud      | field_5       | ✅ field_5   | ✅ Latitud    |```

| Longitud     | field_6       | ✅ field_6   | ✅ Longitud   |https://TU-USUARIO.github.io/airsoft-qr/?team=pakistan

```

**En Power Automate:**

- Filter Query: `field_2 eq '@{variables('varDeviceID')}' and field_1 eq '@{variables('varEquipo')}'`**Recomendaciones de generadores QR**:

- Order By: `field_3 desc`- [QR Code Generator](https://www.qr-code-generator.com/)

- UltimaCaptura: `first(body('Obtener_elementos')?['value'])?['field_3']`- [QRCode Monkey](https://www.qrcode-monkey.com/)

- Comando CLI: `qrencode -o qr-india.png "URL"`

## 🧪 Herramientas de Testing

## �️ Configuración de Ubicación

### Diagnóstico Completo

```### Cambiar Coordenadas del Evento

http://localhost:8080/diagnostico.html

```Para modificar la ubicación del evento, edita en `app.js`:

- Verifica config.json cargado

- Testea conectividad a Power Automate```javascript

- Prueba GPS, LocalStorage, Device ID// Coordenadas fijas del evento (Rosario, Argentina)

- Tests de integración end-to-endconst EVENT_LOCATION = {

    lat: -32.8311426,  // Tu latitud

### Test Manual    lng: -60.7055789,  // Tu longitud

```    zoom: 17           // Nivel de zoom (15-18 recomendado)

http://localhost:8080/test-capture.html};

``````

- Envía capturas de prueba

- Simula escenarios de cooldown### Obtener Coordenadas

- Verifica respuestas en tiempo real

1. Abre [Google Maps](https://maps.google.com)

## 📊 Estructura del Proyecto2. Click derecho en la ubicación deseada

3. Click en las coordenadas para copiarlas

```4. Reemplaza en `EVENT_LOCATION`

airsoft-qr/

├── index.html              # App principal### Mapa de Fondo

├── app.js                  # Lógica de la aplicación

├── styles.css              # Estilos y animacionesEl sistema usa tiles de **OpenStreetMap** gratuitos. Si quieres cambiar el estilo:

├── config.json             # Configuración (URL de API)

├── manifest.json           # PWA manifest- **Por defecto**: `tile.openstreetmap.org` (calles)

├── diagnostico.html        # Herramienta de testing- **Satelital**: Requiere API key de Mapbox o Google Maps

├── test-capture.html       # Tests manuales

└── README.md               # Esta documentación## �🔧 Configuración del Backend

```

El sitio envía un POST con el siguiente payload:

## 🎨 Personalización

```json

### Cambiar Ubicación del Evento{

  "team": "india",

```javascript  "ts": "2025-10-06T12:34:56.789Z",

// En config.json  "deviceId": "a1b2c3d4-e5f6-...",

"eventLocation": {  "userAgent": "Mozilla/5.0...",

  "lat": TU_LATITUD,  "location": {

  "lng": TU_LONGITUD,    "lat": -32.83114,      // 5 decimales (límite SharePoint)

  "name": "Tu Ciudad"    "lng": -60.70558,      // 5 decimales (límite SharePoint)

}    "accuracy": 10         // Metros enteros

```  }

}

### Cambiar Tiempo de Cooldown```



```javascript> **📍 Nota sobre precisión GPS:** Las coordenadas se redondean automáticamente a **5 decimales** (~1.1m de precisión) para compatibilidad con SharePoint. Esto es suficiente para eventos de Airsoft.

// En config.json

"cooldownMinutes": 60  // Cambiar según necesites (60 = 1 hora)### Endpoint Requerido

```

- **URL**: Configurable (ver sección anterior)

### Cambiar Colores de Equipos- **Método**: `POST`

- **Content-Type**: `application/json`

```css- **Respuesta esperada**: HTTP 200-299 para éxito

/* En styles.css */- **Backend recomendado**: Ver `BACKEND_POWERAUTOMATE.md` para implementación con Microsoft 365

:root {

    --india-primary: #1BBE84;### Validación del Servidor (Recomendado)

    --india-accent: #E8C547;

    --pakistan-primary: #0B7A4B;El cooldown del lado cliente es básico. Para mayor seguridad:

    --pakistan-accent: #C2B280;

}1. **Validar `deviceId`** y/o IP en el servidor

```2. **Rechazar capturas duplicadas** dentro de los 60 minutos

3. **Rate limiting** por IP/dispositivo

## 🐛 Troubleshooting4. **Verificar timestamp** para evitar manipulación de hora local



### Config.json no carga en GitHub Pages## 🧪 Pruebas Locales



**Causa:** Estaba en `.gitignore`### Opción 1: Con Python



**Solución:**```bash

```bashpython -m http.server 8000

git add config.json# Abre: http://localhost:8000/?team=india

git commit -m "Add config for GitHub Pages"```

git push origin main

```### Opción 2: Con Node.js (http-server)



### Power Automate no recibe datos```bash

npx http-server -p 8000 -c-1

**Verificar:**# Abre: http://localhost:8000/?team=pakistan

1. URL no expiró (regenerar en Flow si es necesario)```

2. Flow está activado

3. SharePoint tiene permisos correctos### Opción 3: Con la extensión Live Server de VS Code

4. Usar `diagnostico.html` para testear

1. Instala "Live Server" desde el marketplace

### Líneas del juego no coinciden con pins2. Click derecho en `index.html` → "Open with Live Server"

3. Añade `?team=india` o `?team=pakistan` a la URL

**Solución:** Ya está corregido. El SVG ahora ajusta dinámicamente su `viewBox` al tamaño del contenedor.

## 🎯 Criterios de Aceptación

### Textos GPS no se ven bien

- ✅ Carga correcta con `?team=india` o `?team=pakistan`

**Solución:** Ya está corregido. Los textos ahora están centrados en pantalla con mejor contraste.- ✅ Mini-juego completable en < 10 segundos

- ✅ Animación de "BASE CAPTURADA" al finalizar

### Animación GPS se repite después de captura- ✅ Cooldown de 60 minutos (1 hora) activo tras captura

- ✅ POST enviado a API configurada

**Solución:** Ya está corregido. El sistema verifica el cooldown antes de mostrar la animación.- ✅ Reintentos automáticos en caso de fallo de red

- ✅ Contador regresivo visible durante cooldown

## 📱 Uso en Evento Real- ✅ Persistencia del cooldown tras recargar página

- ✅ Ligero y funcional en móviles con 4G

### Preparación

## 🎨 Personalización

1. Imprimir QR codes:

   - India: `https://w0n3j0.github.io/airsoft-qr/?team=india`### Cambiar Duración del Cooldown

   - Pakistan: `https://w0n3j0.github.io/airsoft-qr/?team=pakistan`

En `app.js`, línea 7:

2. Colocar QR en bases del equipo contrario

```javascript

3. Todos conectados a WiFi o datos móvilesconst COOLDOWN_DURATION = 30 * 60 * 1000; // Cambiar según necesites

```

4. Verificar GPS funciona en el área

### Modificar Colores

### Durante el Evento

En `styles.css`, variables CSS al inicio:

- Jugadores escanean QR

- Completan mini-juego```css

- Sistema valida y guarda:root {

- Cooldown se activa automáticamente    --india-primary: #1BBE84;

- Monitorear en SharePoint en tiempo real    --pakistan-primary: #0B7A4B;

    /* ... más variables ... */

## 🔐 Seguridad}

```

La URL de Power Automate incluye un token `sig=` que actúa como autenticación. Es seguro porque:

### Ajustar Dificultad del Juego

1. Solo acepta POST con esquema específico

2. El token puede regenerarse en cualquier momentoEn `app.js`, modificar el array `wireData` para añadir más cables:

3. Power Automate valida cada request

4. El cooldown previene abuse```javascript

const wireData = [

Para regenerar el token:    { id: 'a', symbol: '▲', color: 'red' },

1. Edita el Flow en Power Automate    { id: 'b', symbol: '●', color: 'green' },

2. Guarda (aunque no cambies nada)    { id: 'c', symbol: '◆', color: 'blue' },

3. Nueva URL con nuevo `sig=`    { id: 'd', symbol: '■', color: 'yellow' } // Cuarto cable

];

## 📊 Comandos de Consola Útiles```



```javascript## 🐛 Troubleshooting

// Ver configuración

console.log(CONFIG)### El juego no envía datos



// Ver Device ID1. Verifica que `data-api` esté configurado en `<body>`

localStorage.getItem('deviceId')2. Abre la consola del navegador (F12) y busca errores

3. Revisa que el servidor acepte CORS si está en dominio diferente

// Verificar cooldown

localStorage.getItem('captureCooldown:india')### Cooldown no funciona



// Limpiar cooldown para probar- Verifica que `localStorage` esté habilitado en el navegador

localStorage.removeItem('captureCooldown:india')- Prueba en modo incógnito para descartar conflictos



// Limpiar todo### Animaciones no se ven

localStorage.clear()

location.reload()- El usuario puede tener `prefers-reduced-motion` activo

```- Verifica compatibilidad del navegador con CSS animations



## 🚀 Changelog Reciente## 📱 Compatibilidad



### v1.3.0 (2025-10-06)- **Navegadores**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+

- ✅ Fix: Líneas del mini-juego ahora coinciden perfectamente con pins- **Dispositivos**: iOS 14+, Android 9+

- ✅ Fix: Textos GPS centrados en pantalla para mejor visibilidad- **Funciones opcionales**:

- ✅ Fix: config.json ahora se sube a GitHub Pages  - Vibración: Requiere soporte de `navigator.vibrate` (Android principalmente)

- ✅ Fix: Animación GPS no se repite si hay cooldown activo  - Service Worker: No implementado (opcional para futuras versiones)

- ✅ Mejora: SVG con viewBox dinámico

- ✅ Docs: Consolidación en un solo README## 🔒 Seguridad



## 🎯 Stack Tecnológico⚠️ **Importante**: Este es un sistema del lado cliente. La validación real debe hacerse en el servidor:



**Frontend:**- No confiar en el `deviceId` (puede ser manipulado)

- HTML5, CSS3, Vanilla JavaScript- Validar timestamps en el servidor

- Canvas API, SVG, Geolocation API- Implementar rate limiting

- LocalStorage, PWA-ready- Considerar geolocalización si es crítico



**Backend (Serverless):**## 📄 Licencia

- Microsoft Power Automate

- SharePoint ListsEste proyecto es de código abierto. Úsalo y modifícalo libremente para tus eventos de Airsoft.

- GitHub Pages (hosting)

## 🤝 Contribuciones

## 📄 Licencia

¿Mejoras o sugerencias? Siéntete libre de abrir un issue o pull request.

MIT License - Libre para usar y modificar

---

## 👤 Autor

**¡Buena suerte en tu evento de Airsoft! 🎯🔫**

**w0n3j0**
- GitHub: [@w0n3j0](https://github.com/w0n3j0)
- Proyecto: [airsoft-qr](https://github.com/w0n3j0/airsoft-qr)

---

**¿Preguntas?** Abre un [issue](https://github.com/w0n3j0/airsoft-qr/issues)

**¿Te gustó?** Dale una ⭐ en GitHub

---

**Última actualización:** 6 de octubre de 2025
