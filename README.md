# 🎯 Sistema de Captura de Bases - Airsoft

Sistema web estático para eventos de Airsoft con temática **India vs Pakistán**. Los jugadores escanean códigos QR para acceder a un mini-juego que, al completarse, captura la base y envía los datos al sistema de puntuación.

## 🚀 Características

- **🎯 100% Optimizado para Móvil**: Diseñado exclusivamente para celulares con controles táctiles grandes
- **📍 Animación GPS Espectacular**: Mapa táctico con zoom hacia la ubicación del jugador al escanear QR
- **🎮 Mini-juego Táctil**: Conectar cables en menos de 10 segundos con áreas táctiles optimizadas
- **⏱️ Sistema de Cooldown**: Bloqueo de 30 minutos por dispositivo tras captura exitosa
- **🔄 Reintentos Automáticos**: Cola de eventos con reintentos en caso de fallos de red
- **🎨 Temática HUD Militar**: Animaciones de radar, mapa táctico y efectos visuales por bando
- **📦 Sin Dependencias**: Vanilla JS, ligero (< 70KB)
- **📱 PWA-Ready**: Instalable en pantalla principal del móvil
- **🌍 Geolocalización**: Captura y envía ubicación GPS precisa de cada captura

## 📁 Estructura del Proyecto

```
airsoft-qr/
├── index.html              # Página principal
├── styles.css              # Estilos y animaciones
├── app.js                  # Lógica del juego y API
├── manifest.json           # Manifest PWA
├── config.example.json     # Ejemplo de configuración de API
└── README.md              # Este archivo
```

## 🎮 Cómo Funciona

### Flujo del Usuario

1. **Escanear QR**: El usuario escanea uno de los dos códigos QR (India o Pakistán)
2. **Acceder al juego**: Se carga la página con el tema del bando correspondiente
3. **Mini-juego**: Conectar 3 pares de cables arrastrando desde los pines izquierdos a los derechos
4. **Captura exitosa**: Al completar, aparece animación de "BASE CAPTURADA"
5. **Envío de datos**: POST al servidor con información de captura
6. **Cooldown**: El dispositivo queda bloqueado 30 minutos para ese bando

### URLs por Bando

- **India**: `https://tu-usuario.github.io/airsoft-qr/?team=india`
- **Pakistán**: `https://tu-usuario.github.io/airsoft-qr/?team=pakistan`

## 📦 Despliegue en GitHub Pages

### 1. Configurar el Repositorio

```bash
# Si aún no tienes el repo iniciado
git init
git add .
git commit -m "Sistema de captura de bases completo"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/airsoft-qr.git
git push -u origin main
```

### 2. Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. En **Source**, selecciona `main` branch y carpeta `/ (root)`
4. Haz clic en **Save**
5. En unos minutos estará disponible en: `https://TU-USUARIO.github.io/NOMBRE-REPO/`

### 3. Configurar la API

#### Opción A: En el HTML directamente

Edita `index.html` y añade la URL en el atributo `data-api`:

```html
<body data-api="https://tu-servidor.com/api/capture">
```

#### Opción B: Con archivo config.json

1. Copia `config.example.json` a `config.json`
2. Edita el `apiUrl` con tu endpoint real
3. Modifica `app.js` para cargar la configuración (opcional, ya incluido básicamente)

**Nota**: Si usas `config.json`, asegúrate de añadirlo al `.gitignore` si contiene información sensible.

## 🎨 Generar Códigos QR

Usa cualquier generador de QR con las siguientes URLs:

### Para el Bando India
```
https://TU-USUARIO.github.io/airsoft-qr/?team=india
```

### Para el Bando Pakistán
```
https://TU-USUARIO.github.io/airsoft-qr/?team=pakistan
```

**Recomendaciones de generadores QR**:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)
- Comando CLI: `qrencode -o qr-india.png "URL"`

## 🔧 Configuración del Backend

El sitio envía un POST con el siguiente payload:

```json
{
  "team": "india",
  "ts": "2025-10-06T12:34:56.789Z",
  "deviceId": "a1b2c3d4-e5f6-...",
  "userAgent": "Mozilla/5.0..."
}
```

### Endpoint Requerido

- **URL**: Configurable (ver sección anterior)
- **Método**: `POST`
- **Content-Type**: `application/json`
- **Respuesta esperada**: HTTP 200-299 para éxito

### Validación del Servidor (Recomendado)

El cooldown del lado cliente es básico. Para mayor seguridad:

1. **Validar `deviceId`** y/o IP en el servidor
2. **Rechazar capturas duplicadas** dentro de los 30 minutos
3. **Rate limiting** por IP/dispositivo
4. **Verificar timestamp** para evitar manipulación de hora local

## 🧪 Pruebas Locales

### Opción 1: Con Python

```bash
python -m http.server 8000
# Abre: http://localhost:8000/?team=india
```

### Opción 2: Con Node.js (http-server)

```bash
npx http-server -p 8000 -c-1
# Abre: http://localhost:8000/?team=pakistan
```

### Opción 3: Con la extensión Live Server de VS Code

1. Instala "Live Server" desde el marketplace
2. Click derecho en `index.html` → "Open with Live Server"
3. Añade `?team=india` o `?team=pakistan` a la URL

## 🎯 Criterios de Aceptación

- ✅ Carga correcta con `?team=india` o `?team=pakistan`
- ✅ Mini-juego completable en < 10 segundos
- ✅ Animación de "BASE CAPTURADA" al finalizar
- ✅ Cooldown de 30 minutos activo tras captura
- ✅ POST enviado a API configurada
- ✅ Reintentos automáticos en caso de fallo de red
- ✅ Contador regresivo visible durante cooldown
- ✅ Persistencia del cooldown tras recargar página
- ✅ Ligero y funcional en móviles con 4G

## 🎨 Personalización

### Cambiar Duración del Cooldown

En `app.js`, línea 7:

```javascript
const COOLDOWN_DURATION = 30 * 60 * 1000; // Cambiar según necesites
```

### Modificar Colores

En `styles.css`, variables CSS al inicio:

```css
:root {
    --india-primary: #1BBE84;
    --pakistan-primary: #0B7A4B;
    /* ... más variables ... */
}
```

### Ajustar Dificultad del Juego

En `app.js`, modificar el array `wireData` para añadir más cables:

```javascript
const wireData = [
    { id: 'a', symbol: '▲', color: 'red' },
    { id: 'b', symbol: '●', color: 'green' },
    { id: 'c', symbol: '◆', color: 'blue' },
    { id: 'd', symbol: '■', color: 'yellow' } // Cuarto cable
];
```

## 🐛 Troubleshooting

### El juego no envía datos

1. Verifica que `data-api` esté configurado en `<body>`
2. Abre la consola del navegador (F12) y busca errores
3. Revisa que el servidor acepte CORS si está en dominio diferente

### Cooldown no funciona

- Verifica que `localStorage` esté habilitado en el navegador
- Prueba en modo incógnito para descartar conflictos

### Animaciones no se ven

- El usuario puede tener `prefers-reduced-motion` activo
- Verifica compatibilidad del navegador con CSS animations

## 📱 Compatibilidad

- **Navegadores**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **Dispositivos**: iOS 14+, Android 9+
- **Funciones opcionales**:
  - Vibración: Requiere soporte de `navigator.vibrate` (Android principalmente)
  - Service Worker: No implementado (opcional para futuras versiones)

## 🔒 Seguridad

⚠️ **Importante**: Este es un sistema del lado cliente. La validación real debe hacerse en el servidor:

- No confiar en el `deviceId` (puede ser manipulado)
- Validar timestamps en el servidor
- Implementar rate limiting
- Considerar geolocalización si es crítico

## 📄 Licencia

Este proyecto es de código abierto. Úsalo y modifícalo libremente para tus eventos de Airsoft.

## 🤝 Contribuciones

¿Mejoras o sugerencias? Siéntete libre de abrir un issue o pull request.

---

**¡Buena suerte en tu evento de Airsoft! 🎯🔫**
