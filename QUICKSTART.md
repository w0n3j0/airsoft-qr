# 🚀 Inicio Rápido - Configuración

## ✅ ¡Tu endpoint ya está configurado!

El archivo `config.json` ya tiene tu endpoint de Power Automate:

```
https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dbfd1137e73d47c0ae8b70059482af6d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Gofxf3xOYqJtWV6n3PcLLEr0TuoxrwMf5bsWYdP8lYA
```

## 🧪 Probar Localmente

1. **Iniciar servidor local:**
   ```bash
   npx http-server -p 8080 -c-1
   ```

2. **Abrir en navegador:**
   ```
   http://localhost:8080/?team=india
   ```

3. **Aceptar permisos GPS** (o rechazar para probar sin GPS)

4. **Completar el mini-juego**

5. **Verificar en SharePoint** que se creó el registro

## 🌐 Probar Online (GitHub Pages)

**URLs de producción:**

- **Equipo India:**
  ```
  https://w0n3j0.github.io/airsoft-qr/?team=india
  ```

- **Equipo Pakistán:**
  ```
  https://w0n3j0.github.io/airsoft-qr/?team=pakistan
  ```

## 📱 Generar QR Codes

Usa cualquier generador de QR online:

1. **[QR Code Generator](https://www.qr-code-generator.com/)**
2. Pega la URL completa con `?team=india` o `?team=pakistan`
3. Descarga el QR en alta resolución
4. Imprime o muestra en pantalla

## 🔍 Verificar que Funciona

### 1. Test Local

```bash
# En PowerShell
curl -Method POST `
  -Uri "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dbfd1137e73d47c0ae8b70059482af6d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Gofxf3xOYqJtWV6n3PcLLEr0TuoxrwMf5bsWYdP8lYA" `
  -ContentType "application/json" `
  -Body '{
    "team": "india",
    "ts": "2025-10-06T20:00:00.000Z",
    "deviceId": "test-123",
    "userAgent": "Test",
    "location": {
      "lat": -32.83114,
      "lng": -60.70558,
      "accuracy": 10
    }
  }'
```

**✅ Respuesta esperada:**
```json
{
  "success": true,
  "message": "Base capturada correctamente",
  "team": "india",
  "captureId": 1,
  "points": 100,
  "timestamp": "2025-10-06T20:00:00.000Z"
}
```

### 2. Verificar en SharePoint

1. Ve a tu lista **"Capturas Airsoft"**
2. Deberías ver un nuevo registro:
   - **Equipo:** India
   - **DeviceID:** test-123
   - **Latitud:** -32.83114
   - **Longitud:** -60.70558
   - **Timestamp:** [Fecha actual]

### 3. Test de Cooldown

1. Ejecuta el mismo comando dos veces seguidas
2. La segunda vez debería responder:

```json
{
  "success": false,
  "error": "Cooldown activo",
  "remainingMinutes": 30,
  "message": "Debes esperar 30 minutos más"
}
```

## ⚙️ Configuración Adicional

### Cambiar Cooldown

Edita `config.json`:
```json
{
  "cooldownMinutes": 15  // Cambiar de 30 a 15 minutos
}
```

**⚠️ IMPORTANTE:** También debes cambiar la variable en Power Automate:
- `varCooldownMinutos` = 15

### Cambiar Ubicación del Evento

Edita `app.js`:
```javascript
const EVENT_LOCATION = {
    lat: TU_LATITUD,      // Ejemplo: -34.603722
    lng: TU_LONGITUD,     // Ejemplo: -58.381592
    zoom: 17
};
```

Ver guía completa: [`LOCATION.md`](./LOCATION.md)

## 📊 Monitoreo en Tiempo Real

### Opción 1: SharePoint

```
https://tuempresa.sharepoint.com/sites/tu-sitio/Lists/Capturas%20Airsoft
```

### Opción 2: Power Automate

```
https://make.powerautomate.com
→ Mis flujos
→ API Captura Airsoft
→ Historial de ejecución (últimas 28 días)
```

### Opción 3: Power BI

Conecta tu lista de SharePoint a Power BI para dashboards en tiempo real.

## 🐛 Troubleshooting

### Error: "No se encontró URL de API"

**Solución:** Verifica que `config.json` existe y tiene el campo `apiUrl`.

### Error: "Failed to fetch"

**Causas posibles:**
1. **CORS:** Power Automate debería permitir CORS por defecto
2. **URL incorrecta:** Verifica que copiaste toda la URL con `?api-version=...`
3. **Flow pausado:** Verifica que el Flow esté activo en Power Automate

**Solución rápida:** Abre la consola del navegador (F12) y busca el error específico.

### GPS no funciona

**Causas:**
1. **HTTP local:** El navegador bloquea GPS en `http://localhost`
   - **Solución:** Usa GitHub Pages (HTTPS) para probar GPS
2. **Permisos denegados:** El usuario rechazó los permisos
   - **Solución:** El sistema continúa sin GPS automáticamente

### Cooldown no funciona

**Verifica:**
1. La columna `Timestamp` en SharePoint tiene formato de fecha/hora
2. El filtro en "Obtener elementos" está correcto:
   ```
   DeviceID eq '@{variables('varDeviceID')}' and Equipo eq '@{variables('varEquipoCapitalizado')}'
   ```
3. La expresión de cálculo de minutos es correcta

## 📚 Documentación Completa

- **Power Automate (Técnico):** [`BACKEND_POWERAUTOMATE.md`](./BACKEND_POWERAUTOMATE.md)
- **Power Automate (Visual):** [`POWERAUTOMATE_GUIA_VISUAL.md`](./POWERAUTOMATE_GUIA_VISUAL.md)
- **Configuración GPS:** [`LOCATION.md`](./LOCATION.md)
- **Móvil:** [`MOBILE.md`](./MOBILE.md)
- **Backend Alternativo:** [`BACKEND.md`](./BACKEND.md)

## 🎯 Checklist Pre-Evento

- [ ] ✅ Flow de Power Automate activo
- [ ] ✅ Lista de SharePoint creada con columnas correctas
- [ ] ✅ `config.json` con endpoint correcto
- [ ] ✅ Test exitoso desde PowerShell/Postman
- [ ] ✅ Test desde navegador (localhost)
- [ ] ✅ Test desde móvil (GitHub Pages)
- [ ] ✅ QR codes generados para ambos equipos
- [ ] ✅ Cooldown validado (30 minutos)
- [ ] ✅ GPS funcionando en móvil
- [ ] ✅ Dashboard/reporte configurado

## 🎉 ¡Listo para el Evento!

Tu sistema está 100% funcional. Solo necesitas:

1. **Imprimir los QR codes** con las URLs de GitHub Pages
2. **Colocarlos en las bases** del evento
3. **Monitorear en tiempo real** desde SharePoint o Power BI

**¡Buena suerte con el evento! 🎯🔫**
