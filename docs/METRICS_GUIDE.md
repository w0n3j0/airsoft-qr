# 📊 Página de Métricas - Guía de Uso

## 🎯 ¿Qué es?

Una página web privada que muestra en tiempo real las estadísticas del evento de Airsoft:
- Puntaje de cada equipo (India vs Pakistan)
- Total de capturas
- Dispositivos únicos
- Precisión GPS promedio
- Historial completo de capturas

---

## 🔗 URLs de Acceso

### Local (testing)
```
http://localhost:8080/metrics.html
```

### GitHub Pages (producción)
```
https://w0n3j0.github.io/airsoft-qr/metrics.html
```

⚠️ **IMPORTANTE:** Esta URL es pública en GitHub Pages. Solo compártela con organizadores del evento.

---

## 🎨 Características

### 1. Scoreboard en Tiempo Real
- **India** 🇮🇳 (verde claro) vs **Pakistan** 🇵🇰 (verde oscuro)
- Números grandes con efectos visuales
- Actualización automática

### 2. Estadísticas Generales
- **Total Capturas**: Suma de ambos equipos
- **Dispositivos Únicos**: Cuántos jugadores diferentes participaron
- **Precisión GPS Promedio**: Calidad de señal GPS promedio
- **Última Captura**: Tiempo transcurrido desde la última captura

### 3. Historial de Capturas (Tabla)
Muestra todas las capturas ordenadas por más recientes:
- **#**: Número de orden
- **Equipo**: Badge con color del equipo
- **Timestamp**: "Hace Xm" o fecha completa
- **Device ID**: Identificador único del dispositivo (acortado)
- **Precisión GPS**: 
  - 🟢 Verde (≤20m) = Excelente
  - 🟡 Amarillo (21-50m) = Bueno
  - 🟠 Naranja (51-100m) = Regular
  - 🔴 Rojo (>100m) = Pobre
- **Estado**: Activa/Cooldown/Expirada

### 4. Auto-Refresh
- Se actualiza automáticamente cada **30 segundos**
- También puedes hacer clic en el botón **"🔄 Actualizar Datos"** para refresh manual

---

## 🚀 Cómo Usar

### Durante el Evento

1. **Abre la página** en tu navegador:
   ```
   https://w0n3j0.github.io/airsoft-qr/metrics.html
   ```

2. **Proyecta en pantalla grande** (opcional):
   - Conecta laptop a TV/proyector
   - Presiona F11 para pantalla completa
   - Deja la página abierta

3. **Monitoreo en tiempo real**:
   - Los datos se actualizan automáticamente cada 30 segundos
   - No necesitas hacer nada, solo observar

### Después del Evento

- Comparte capturas de pantalla del scoreboard final
- Exporta los datos desde SharePoint si necesitas análisis más profundo

---

## 🔒 Seguridad

### ¿Es seguro compartir la URL?

**SÍ**, porque:
1. El endpoint de Power Automate tiene firma de seguridad (`sig=...`)
2. Solo permite operación GET/POST específica
3. No expone credenciales
4. Solo muestra datos del evento (no información sensible)

**PERO:**
- No la publiques en redes sociales públicas
- Solo compártela con organizadores
- Si quieres más seguridad, considera:
  - Usar GitHub Pages privado (requiere cuenta Pro)
  - Agregar autenticación básica
  - Usar un dominio personalizado

---

## 📱 Responsive Design

La página funciona perfectamente en:
- 💻 **Desktop**: Vista completa con todas las métricas
- 📱 **Móvil**: Diseño adaptado para pantallas pequeñas
- 📺 **Proyector**: Ideal para mostrar en pantalla grande durante el evento

---

## 🎯 Casos de Uso

### 1. Durante el Evento
```
📺 Proyector mostrando metrics.html
👥 Jugadores viendo el puntaje en tiempo real
🎮 Organizadores monitoreando capturas
```

### 2. Árbitros/Organizadores
```
📊 Verificar capturas en tiempo real
🔍 Detectar problemas de GPS (precisión baja)
⚠️ Identificar dispositivos duplicados
```

### 3. Post-Evento
```
📸 Captura de pantalla del scoreboard final
📈 Análisis de participación (dispositivos únicos)
🏆 Anuncio del equipo ganador
```

---

## 🛠️ Personalización

Si quieres modificar la página, edita `metrics.html`:

### Cambiar intervalo de auto-refresh
```javascript
// Línea ~596
setInterval(loadMetrics, 30000); // 30 segundos

// Cambiar a 15 segundos:
setInterval(loadMetrics, 15000);
```

### Cambiar endpoint
```javascript
// Línea ~433
const METRICS_ENDPOINT = 'TU_NUEVO_ENDPOINT_AQUI';
```

### Modificar colores
```css
/* Líneas 15-23 */
:root {
    --india-primary: #138808;      /* Verde India */
    --pakistan-primary: #0B7A4B;   /* Verde Pakistan */
    --bg-dark: #0B0F12;             /* Fondo oscuro */
    --text-light: #E8F5E9;          /* Texto claro */
}
```

---

## 🐛 Troubleshooting

### "Error al cargar datos"

**Posibles causas:**
1. Endpoint de Power Automate incorrecto
2. Flow de Power Automate detenido
3. Problema de CORS
4. Sin conexión a internet

**Solución:**
```javascript
// Verificar en consola del navegador (F12):
console.log('Verificando endpoint...');

// Probar endpoint manualmente:
fetch('TU_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
})
.then(r => r.json())
.then(d => console.log(d));
```

### "Cargando datos..." infinito

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca errores en rojo
5. Si ves error CORS, verifica que el Flow permite solicitudes desde tu dominio

### Datos no se actualizan

1. Verifica que el botón "Actualizar" funcione
2. Mira la hora en "Última actualización"
3. Si está congelado, recarga la página (F5)

---

## 📊 Ejemplo de Salida

```
┌────────────────────────────────────────┐
│     📊 MÉTRICAS DEL EVENTO             │
│   India vs Pakistan - Captura Bases    │
│                                        │
│        [🔄 Actualizar Datos]           │
│  Última actualización: 20:45:30        │
└────────────────────────────────────────┘

┌────────────┬────────────┐
│ 🇮🇳 INDIA  │ 🇵🇰 PAKISTAN│
│     12     │     8      │
│  Capturas  │  Capturas  │
└────────────┴────────────┘

┌─────────────┬────────────────┬──────────────┬───────────────┐
│Total: 20    │Dispositivos: 5 │GPS: 15m      │Última: Hace 2m│
└─────────────┴────────────────┴──────────────┴───────────────┘

📋 HISTORIAL DE CAPTURAS
┌──┬──────────┬────────────┬──────────────┬──────────┬────────┐
│# │Equipo    │Timestamp   │Device ID     │Precisión │Estado  │
├──┼──────────┼────────────┼──────────────┼──────────┼────────┤
│1 │🇮🇳 India │Hace 2m     │9192768a...   │14m 🟢    │Activa  │
│2 │🇵🇰 Pakist│Hace 5m     │6ce7b723...   │12m 🟢    │Activa  │
│3 │🇮🇳 India │Hace 12m    │9192768a...   │200m 🔴   │Activa  │
└──┴──────────┴────────────┴──────────────┴──────────┴────────┘
```

---

## 🎉 Beneficios

### Para Jugadores
- ✅ Ver puntaje en tiempo real
- ✅ Saber cuándo fue la última captura
- ✅ Motivación competitiva

### Para Organizadores
- ✅ Monitoreo centralizado
- ✅ Detección de problemas (GPS pobre)
- ✅ Sin necesidad de consultar SharePoint manualmente
- ✅ Pantalla profesional para proyectar

### Para el Evento
- ✅ Experiencia más profesional
- ✅ Mayor engagement de participantes
- ✅ Transparencia en puntuación
- ✅ Fácil de compartir y mostrar

---

## 🔗 URLs Importantes

```
Página de Métricas (producción):
https://w0n3j0.github.io/airsoft-qr/metrics.html

Página de Captura (India):
https://w0n3j0.github.io/airsoft-qr/?team=india

Página de Captura (Pakistan):
https://w0n3j0.github.io/airsoft-qr/?team=pakistan
```

---

**Archivo creado:** `metrics.html`  
**Commit:** 035632d  
**Estado:** ✅ Listo para usar  
**Actualización automática:** Cada 30 segundos

---

**Pro Tip:** 💡 Abre `metrics.html` en una tablet y déjala cerca del área de juego para que todos puedan ver el puntaje en tiempo real!
