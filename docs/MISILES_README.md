# 🚀 Sistema de Misiles - Guía Rápida

## Descripción

Sistema de **3 misiles** como objetivos secundarios independientes del sistema de captura de bases. Los jugadores pueden encontrar y desactivar estos misiles durante el evento.

## 🎯 Características

- ✅ **3 misiles independientes** (no afectan el sistema de bases)
- ✅ **Una sola desactivación** por misil (permanente)
- ✅ **Sin cooldown** entre misiles
- ✅ **Captura GPS** de la ubicación de desactivación
- ✅ **Visualización en tiempo real** en página de métricas
- ✅ **Diseño temático militar** con animaciones

## 📋 URLs del Sistema

### Página para Desactivar Misiles
- **Misil 1:** `https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=1`
- **Misil 2:** `https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=2`
- **Misil 3:** `https://TU-USUARIO.github.io/airsoft-qr/misil.html?missile=3`

### Página de Métricas
- **Métricas:** `https://TU-USUARIO.github.io/airsoft-qr/metrics.html`
  - Muestra el estado de los 3 misiles
  - 🔴 ARMADO = No desactivado
  - 🟢 DESACTIVADO = Ya neutralizado

## 🔧 Configuración

### 1. Backend (Power Automate + SharePoint)

Sigue la guía completa: **[MISILES_BACKEND.md](./MISILES_BACKEND.md)**

**Resumen:**
- Crear lista "Misiles" en SharePoint con 3 items
- Crear Flow para POST (desactivar misil)
- Crear Flow para GET (consultar estado)
- Configurar URLs en `config.json`

### 2. Frontend (config.json)

```json
{
  "apiUrl": "URL_CAPTURAS",
  "missileApiUrl": "URL_FLOW_POST_MISILES",
  "missileMetricsUrl": "URL_FLOW_GET_MISILES",
  "cooldownMinutes": 30
}
```

### 3. Generar QR Codes

Genera los códigos QR con las URLs de cada misil e imprímelos en tamaño A5 o mayor.

**Herramientas:**
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## 🎮 Uso en el Evento

### Preparación

1. **Verificar estado inicial** en SharePoint:
   - Los 3 misiles deben estar en estado "Armado"
   - Campos DeviceID, Timestamp, etc. vacíos

2. **Colocar QR codes:**
   - Imprime cada QR en formato grande y plastificado
   - Colócalos en ubicaciones estratégicas del campo
   - Opcional: Añade el número del misil visible junto al QR

3. **Briefing a jugadores:**
   - Explica que los misiles son objetivos secundarios opcionales
   - No afectan el sistema de captura de bases
   - Solo se pueden desactivar una vez

### Durante el Evento

1. **Jugador encuentra un QR** de misil
2. **Escanea el código** con su móvil
3. **Ve el estado** del misil (Armado/Desactivado)
4. **Pulsa "Desactivar Ahora"** si está armado
5. **Confirmación visual** - Aparece ✅ MISIL DESACTIVADO

### Monitoreo en Tiempo Real

Abre `metrics.html` en una tablet/laptop para ver:
- Estado actual de cada misil
- Timestamp de desactivación
- Capturas de bases (sección separada)

## 📊 Datos que se Guardan

Para cada desactivación se registra:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Misil** | Número del misil (1-3) | `1` |
| **Estado** | Armado/Desactivado | `Desactivado` |
| **DeviceID** | ID único del dispositivo | `abc-123-xyz` |
| **Timestamp** | Fecha y hora | `2025-10-07 14:30:00` |
| **Latitud** | Coordenada GPS | `-32.83114` |
| **Longitud** | Coordenada GPS | `-60.70558` |
| **Precision** | Precisión GPS en metros | `10` |

## 🔄 Reiniciar para Otro Evento

Para resetear los misiles después de un evento:

1. Ve a SharePoint → Lista "Misiles"
2. Para cada item (1, 2, 3):
   - Cambia **Estado** → `Armado`
   - Limpia: DeviceID, Timestamp, Latitud, Longitud, Precision
3. Guarda los cambios

## 🐛 Troubleshooting

### "Misil inválido"
- Verifica que la URL tenga `?missile=1`, `?missile=2` o `?missile=3`
- Regenera el QR code si es necesario

### "Este misil ya fue desactivado"
- Es correcto, cada misil solo puede desactivarse una vez
- Para resetear, cambia el estado en SharePoint manualmente

### No aparecen en métricas
- Verifica `missileMetricsUrl` en `config.json`
- Verifica que el Flow GET esté activado
- Revisa la consola del navegador (F12) para errores

### Error de GPS
- El sistema funciona sin GPS, pero no guardará coordenadas
- Verifica que el usuario haya aceptado permisos de ubicación

## 📈 Diferencias con Captura de Bases

| Característica | Captura de Bases | Misiles |
|----------------|------------------|---------|
| **Cantidad** | 2 (India, Pakistán) | 3 (numerados) |
| **Mini-juego** | ✅ Conectar cables | ❌ Solo botón |
| **Cooldown** | ✅ 60 minutos | ❌ No hay |
| **Repetible** | ✅ Después del cooldown | ❌ Una sola vez |
| **SharePoint** | Lista "Capturas" | Lista "Misiles" |
| **Tipo** | Objetivo principal | Objetivo secundario |

## 📚 Documentación Relacionada

- **[MISILES_BACKEND.md](./MISILES_BACKEND.md)** - Guía completa de configuración del backend
- **[README.md](./README.md)** - Documentación general del proyecto
- **[BACKEND_POWERAUTOMATE.md](./BACKEND_POWERAUTOMATE.md)** - Backend para captura de bases
- **[METRICS_GUIDE.md](./METRICS_GUIDE.md)** - Guía de la página de métricas

## 🎯 Ejemplo de Flujo Completo

```
1. Evento inicia → 3 misiles armados en SharePoint
2. Jugador A encuentra Misil 1 → Escanea QR
3. Página carga → Estado: 🔴 ARMADO
4. Jugador A pulsa "Desactivar" → Éxito ✅
5. Métricas se actualizan → Misil 1: 🟢 DESACTIVADO
6. Jugador B intenta Misil 1 → Ya desactivado (bloqueado)
7. Jugador B encuentra Misil 2 → Puede desactivarlo
8. Al final del evento → 3 de 3 misiles desactivados 🎉
```

## ⚡ Tips para el Evento

1. **Coloca los misiles estratégicamente:**
   - En zonas disputadas entre ambos bandos
   - Lugares difíciles de alcanzar pero visibles
   - Cerca de objetivos principales para aumentar el conflicto

2. **Considera otorgar puntos extra:**
   - Suma puntos al equipo que desactive más misiles
   - O puntos individuales a jugadores audaces

3. **Protege los QR:**
   - Usa fundas plásticas resistentes
   - Asegúralos bien para evitar que se los lleven
   - Ten QR de respaldo en caso de daños

4. **Monitoreo activo:**
   - Asigna a alguien para vigilar la página de métricas
   - Anuncia por radio cuando se desactive un misil
   - Crea tensión narrando el progreso

---

**¿Preguntas?** Consulta [MISILES_BACKEND.md](./MISILES_BACKEND.md) o abre un [issue en GitHub](https://github.com/w0n3j0/airsoft-qr/issues)

**¡Buena suerte con tus misiles! 🚀**
