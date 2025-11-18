# 🚀 Flow Automático: Auto-Lanzar Misiles después de 60 minutos

**Propósito**: Cambiar automáticamente el estado de "Conteo" a "Lanzado" cuando pasen 60 minutos.

---

## 📋 Configuración del Flow

### Paso 1: Crear el Flow

1. Ve a **Power Automate** (https://make.powerautomate.com)
2. Click en **+ Create** → **Scheduled cloud flow**
3. **Nombre del Flow**: `Auto-Lanzar Misiles - 60 minutos`
4. **Repetir cada**: `5` minutos
5. Click en **Create**

---

## 🔧 Paso 2: Obtener Misiles en Conteo

### Acción: Get items (SharePoint)

1. Click en **+ New step**
2. Buscar: `SharePoint`
3. Seleccionar: **Get items**
4. Configurar:

```
Site Address: [Tu sitio de SharePoint]
List Name: Misiles
Filter Query: field_1 eq 'Conteo'
Top Count: 3
```

**Explicación**: Esto obtiene solo los misiles que están en estado "Conteo" (cuenta regresiva activa).

---

## 🔧 Paso 3: Procesar Cada Misil

### Acción: Apply to each

1. Click en **+ New step**
2. Buscar: `Apply to each`
3. Seleccionar: **Apply to each**
4. En **Select an output from previous steps**:
   - Seleccionar: `value` (del paso anterior "Get items")

---

## 🔧 Paso 4: Calcular Tiempo Transcurrido

### Acción: Compose (dentro del Apply to each)

1. Dentro del "Apply to each", click en **Add an action**
2. Buscar: `Compose`
3. Seleccionar: **Compose**
4. **Rename**: Click en `...` → Rename → `Calcular Segundos Transcurridos`
5. En **Inputs**, pegar esta expresión (YA incluye `int()` al final):

```javascript
int(div(sub(ticks(utcNow()), ticks(items('Apply_to_each')?['field_3'])), 10000000))
```

**Explicación**: 
- `utcNow()` = Hora actual
- `items('Apply_to_each')?['field_3']` = Timestamp cuando se inició el conteo
- `sub()` = Resta para obtener diferencia
- `ticks()` = Convierte a ticks (unidad de tiempo)
- `div(..., 10000000)` = Convierte ticks a segundos
- `int()` = **Convierte el resultado a entero** (esto soluciona el error)

---

## 🔧 Paso 5: Verificar si Pasaron 60 Minutos

### Acción: Condition

1. Dentro del "Apply to each", click en **Add an action**
2. Buscar: `Condition`
3. Seleccionar: **Condition**
4. Configurar la condición **usando el selector visual**:

```
Campo 1: Selecciona "Outputs" (del paso "Calcular Segundos Transcurridos")
Operador: is greater than or equal to
Campo 2: 3600
```

**Explicación**: 
- Como el Compose ahora devuelve un `int()`, no hay problema de tipos
- 3600 segundos = 60 minutos
- Compara directamente el número de segundos

---

## 🔧 Paso 6: Actualizar a "Lanzado" (Si es verdadero)

### Acción: Update item (dentro de "If yes")

1. En la rama **If yes**, click en **Add an action**
2. Buscar: `SharePoint`
3. Seleccionar: **Update item**
4. Configurar:

```
Site Address: [Tu sitio de SharePoint]
List Name: Misiles
Id: ID (seleccionar del contenido dinámico de "Apply to each")
Title: Title (seleccionar del contenido dinámico)
field_1 Value: Lanzado
```

**Campos a completar**:

| Campo | Valor | Fuente |
|-------|-------|--------|
| **Site Address** | Tu sitio | Manual |
| **List Name** | Misiles | Dropdown |
| **Id** | `ID` | Dynamic content |
| **Title** | `Title` | Dynamic content |
| **field_1 (Estado)** | `Lanzado` | Escribir manual |

**⚠️ IMPORTANTE**: 
- NO cambies `field_3` (timestamp) - debe conservar la hora de inicio del conteo
- Solo actualiza `field_1` a "Lanzado"

---

## 🔧 Paso 7: Agregar Logging (Opcional pero Recomendado)

### En la rama "If yes", después de Update item:

1. Click en **Add an action**
2. Buscar: `Compose`
3. Seleccionar: **Compose**
4. **Rename**: `Log Misil Lanzado`
5. En **Inputs**:

```javascript
concat('Misil ', items('Apply_to_each')?['Title'], ' lanzado automáticamente a las ', utcNow())
```

Esto te ayudará a ver en el historial del Flow cuándo se lanzaron los misiles.

---

## 📊 Resumen Visual del Flow

```
┌─────────────────────────────────────┐
│  Trigger: Recurrence (cada 5 min)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Get items (SharePoint)             │
│  Filter: field_1 eq 'Conteo'        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Apply to each (value)              │
│  ┌───────────────────────────────┐  │
│  │ Calcular Segundos Transcurr.  │  │
│  │ (utcNow - field_3)            │  │
│  └─────────────┬─────────────────┘  │
│                │                     │
│                ▼                     │
│  ┌───────────────────────────────┐  │
│  │ Condition                     │  │
│  │ Segundos >= 3600?             │  │
│  └─────┬──────────────┬──────────┘  │
│        │              │              │
│     [YES]          [NO]              │
│        │              │              │
│        ▼              ▼              │
│  ┌─────────┐    (No hacer nada)     │
│  │ Update  │                         │
│  │ Estado  │                         │
│  │ Lanzado │                         │
│  └─────┬───┘                         │
│        │                             │
│        ▼                             │
│  ┌─────────┐                         │
│  │   Log   │                         │
│  └─────────┘                         │
└─────────────────────────────────────┘
```

---

## 🧪 Probar el Flow

### Test Manual:

1. Ve a SharePoint → Lista "Misiles"
2. Edita un misil (ej: Misil 1)
3. Cambia:
   - `field_1` → "Conteo"
   - `field_3` → Fecha/hora de hace 61 minutos
   
   **Ejemplo**: Si ahora son las 15:00, pon: `2025-11-18 14:00:00`

4. Guarda
5. Espera 5 minutos (siguiente ejecución del Flow)
6. Verifica que el estado cambió a "Lanzado"

### Verificar Historial:

1. En Power Automate, ve al Flow
2. Click en el nombre del Flow
3. Ve a **Run history**
4. Verifica que se ejecuta cada 5 minutos
5. Si falló, haz click en la ejecución para ver el error

---

## ⚙️ Expresiones Completas (Para copiar/pegar)

### Calcular Segundos Transcurridos (Paso 4 - Compose):
```javascript
int(div(sub(ticks(utcNow()), ticks(items('Apply_to_each')?['field_3'])), 10000000))
```

**Nota**: El `int()` al inicio es crucial para evitar errores de tipo en el Condition.

### Log de Lanzamiento (Paso 7 - Compose):
```javascript
concat('Misil ', items('Apply_to_each')?['Title'], ' lanzado automáticamente a las ', utcNow())
```

---

## 🔍 Solución de Problemas

### Error: "field_3 is null"
- **Causa**: El campo `field_3` no tiene valor
- **Solución**: Asegúrate de que el Flow POST guarde el timestamp en `field_3` cuando se inicia el conteo

### Error: "Unable to process template language expressions"
- **Causa**: Sintaxis incorrecta en la expresión
- **Solución**: Verifica que copiaste la expresión completa sin espacios extra

### Error: "expects two parameter of matching types... String and Integer"
- **Causa**: El Condition compara String con Integer
- **Solución**: Usa la expresión en modo avanzado con `int()`:
  ```javascript
  @greaterOrEquals(int(outputs('Calcular_Segundos_Transcurridos')), 3600)
  ```

### El Flow no encuentra misiles
- **Causa**: El filtro no está funcionando
- **Solución**: Verifica que en SharePoint el campo `field_1` sea exactamente "Conteo" (con mayúscula)

### El Flow se ejecuta pero no actualiza
- **Causa**: La condición no se cumple
- **Solución**: Verifica que `field_3` tenga una fecha de hace más de 60 minutos

---

## 📊 Monitoreo

### Cada cuánto se ejecuta:
- **Frecuencia**: Cada 5 minutos
- **Ejecuciones por hora**: 12
- **Ejecuciones por día**: 288

### Consumo:
- Si NO hay misiles en conteo: ~1 segundo por ejecución
- Si hay misiles en conteo: ~3 segundos por ejecución
- **Costo**: Gratis en plan gratuito de Power Automate

---

## ✅ Checklist de Configuración

- [ ] Flow creado con nombre "Auto-Lanzar Misiles - 60 minutos"
- [ ] Trigger configurado: Recurrence cada 5 minutos
- [ ] Get items con filtro: `field_1 eq 'Conteo'`
- [ ] Apply to each configurado
- [ ] Calcular segundos transcurridos con expresión correcta
- [ ] Condition: >= 3600 segundos
- [ ] Update item: Estado = "Lanzado"
- [ ] Flow activado (toggle ON)
- [ ] Probado con timestamp antiguo
- [ ] Verificado en Run history

---

## 🎯 Resultado Final

Con este Flow:

1. **Jugador A** escanea QR de "Lanzar Misil 1" a las 14:00
2. Estado cambia a: **"Conteo"** con timestamp 14:00
3. Frontend muestra: **Cuenta regresiva activa**
4. Flow se ejecuta cada 5 minutos verificando
5. A las **15:00** (o 15:05 máximo), el Flow detecta que pasaron 60 min
6. Estado cambia automáticamente a: **"Lanzado"**
7. Frontend muestra: **🚀 MISIL LANZADO**

---

## 🚀 Próximos Pasos

Después de crear este Flow, también necesitas:

1. ✅ Verificar que el Flow POST de misiles guarde el timestamp en `field_3`
2. ✅ Probar el flujo completo: Iniciar → Esperar → Auto-lanzar
3. ✅ Opcional: Crear notificaciones cuando un misil se lance

---

**¿Alguna duda sobre algún paso específico?** 🎯
