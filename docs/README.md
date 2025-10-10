# 📚 Documentación del Sistema Airsoft QR

Esta carpeta contiene toda la documentación técnica del sistema de captura de bases y misiles para eventos de Airsoft.

---

## 🎯 Sistema de Captura de Bases

### [BACKEND_POWERAUTOMATE.md](BACKEND_POWERAUTOMATE.md)
Guía completa para configurar los flows de Power Automate para el sistema de captura de bases. Incluye:
- Configuración de SharePoint
- Flows GET y POST
- Validación de GPS y distancia al HQ
- Sistema de cooldown

### [HQ_VALIDATION.md](HQ_VALIDATION.md)
Documentación del sistema de validación de coordenadas del HQ (cuartel general):
- Cálculo de distancias GPS
- Umbrales de validación
- Manejo de precisión GPS

### [COOLDOWN_UPDATE.md](COOLDOWN_UPDATE.md)
Especificación del sistema de cooldown entre capturas:
- Tiempo de espera de 5 minutos
- Validación por dispositivo
- Mensajes de error

---

## 🚀 Sistema de Misiles

### [MISILES_V2_GUIA.md](MISILES_V2_GUIA.md) ⭐ **PRINCIPAL**
**Guía rápida del nuevo sistema de misiles V2** con 3 estados y 2 QR codes por misil.

### [MISILES_BACKEND_V2.md](MISILES_BACKEND_V2.md) ⭐ **BACKEND V2**
**Configuración completa del backend V2** para Power Automate:
- Sistema de 3 estados: Armado, Lanzado, Desactivado
- Lógica Switch por acción (launch/deactivate)
- Validación de transiciones de estado
- 2 QR codes por misil

### [MISILES_README.md](MISILES_README.md)
Introducción al sistema de misiles y cómo funciona en el juego.

### [MISILES_BACKEND.md](MISILES_BACKEND.md)
Backend original (V1) con 2 estados simples (Armado/Desactivado).

### [MISILES_BACKEND_FIX.md](MISILES_BACKEND_FIX.md)
Guía de troubleshooting para problemas comunes del backend de misiles.

### [IMPLEMENTACION_MISILES.md](IMPLEMENTACION_MISILES.md)
Resumen de la implementación del sistema de misiles V1.

---

## 📊 Sistema de Métricas

### [METRICS_GUIDE.md](METRICS_GUIDE.md)
Guía completa del dashboard de métricas:
- Panel de scores por equipo
- Historial de capturas
- Sistema de confianza GPS/Distancia
- Estado de misiles en tiempo real

### [METRICS_SUMMARY.md](METRICS_SUMMARY.md)
Resumen de las métricas disponibles y cómo interpretarlas.

---

## 🗂️ Estructura de Estados

### Sistema de Captura de Bases
| Campo SharePoint | Descripción |
|------------------|-------------|
| `field_1` | Equipo (India/Pakistan) |
| `field_2` | Device ID |
| `field_3` | Timestamp |
| `field_4` | Latitud GPS |
| `field_5` | Longitud GPS |
| `field_6` | Altitud |
| `field_7` | Precisión GPS |
| `field_8` | Distancia al HQ |
| `field_9` | User Agent |
| `field_10` | Estado (Activa/Inactiva) |

### Sistema de Misiles V2
| Campo SharePoint | Descripción |
|------------------|-------------|
| `Title` | Número del misil (1, 2, 3) |
| `field_1` | Estado (Armado/Lanzado/Desactivado) |
| `field_2` | Device ID |
| `field_3` | Timestamp de última acción |
| `field_4` | Latitud GPS |
| `field_5` | Longitud GPS |
| `field_6` | Precisión GPS |

---

## 🔄 Versiones

### V1 (Original)
- 2 estados de misiles: Armado, Desactivado
- 1 QR code por misil
- Captura de bases con validación GPS

### V2 (Actual) ⭐
- **3 estados de misiles**: Armado, Lanzado, Desactivado
- **2 QR codes por misil**: Lanzar y Desactivar
- Sistema de confianza en métricas
- Validación avanzada de transiciones de estado

---

## 🚀 Quick Start

1. **Configurar Backend**: Sigue [BACKEND_POWERAUTOMATE.md](BACKEND_POWERAUTOMATE.md) y [MISILES_BACKEND_V2.md](MISILES_BACKEND_V2.md)
2. **Configurar Frontend**: Actualiza `config.json` con las URLs de Power Automate
3. **Generar QR Codes**: 
   - Bases: `index.html`
   - Misiles Desactivar: `misil.html?missile=X`
   - Misiles Lanzar: `lanzar-misil.html?missile=X`
4. **Probar**: Usa `test-api.html` y `test-misiles.html`
5. **Monitorear**: Abre `metrics.html` para ver el dashboard en tiempo real

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa [MISILES_BACKEND_FIX.md](MISILES_BACKEND_FIX.md) para troubleshooting
2. Verifica la consola del navegador (F12)
3. Prueba los endpoints con PowerShell (scripts en cada guía backend)

---

**Última actualización**: Octubre 10, 2025  
**Versión**: 2.0 (Sistema Dual-Action)
