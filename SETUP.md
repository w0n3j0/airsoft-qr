# 🚀 Guía de Configuración Rápida

## Paso 1: Configurar la API

Edita el archivo `index.html` y busca la línea:

```html
<body data-api="">
```

Cámbiala por tu URL de API:

```html
<body data-api="https://tu-servidor.com/api/capture">
```

## Paso 2: Probar Localmente

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npx http-server -p 8000 -c-1
```

Luego abre en tu navegador:
- India: http://localhost:8000/?team=india
- Pakistán: http://localhost:8000/?team=pakistan

## Paso 3: Probar el Juego

1. Haz clic en los pines de la izquierda
2. Luego haz clic en el pin correspondiente de la derecha (mismo símbolo y color)
3. Completa las 3 conexiones
4. Verás la animación de "BASE CAPTURADA"

## Paso 4: Verificar el Cooldown

1. Después de capturar, recarga la página con el mismo `?team=`
2. Deberías ver la pantalla de cooldown con el contador
3. Espera 30 minutos o borra el localStorage del navegador para probar de nuevo

**Para borrar localStorage manualmente:**
- Abre DevTools (F12)
- Ve a Application → Storage → Local Storage
- Elimina las claves que empiezan con `captureCooldown:`

## Paso 5: Publicar en GitHub Pages

```bash
# Añade todos los archivos
git add .

# Commit
git commit -m "Sitio de captura de bases listo"

# Push
git push origin main
```

Ve a GitHub → Settings → Pages → Activa Pages desde branch `main`

## Paso 6: Generar los QR

Una vez publicado, genera QR para:

- **India**: `https://TU-USUARIO.github.io/REPO/?team=india`
- **Pakistán**: `https://TU-USUARIO.github.io/REPO/?team=pakistan`

Usa [QRCode Monkey](https://www.qrcode-monkey.com/) o similar.

## Paso 7: Imprimir y Jugar

1. Imprime los códigos QR en papel resistente
2. Colócalos en las ubicaciones de las bases
3. Los jugadores escanean y juegan
4. El servidor recibe las capturas vía POST

---

## 🔧 Troubleshooting Rápido

**No se envía el POST:**
- Verifica que `data-api` esté configurado
- Revisa la consola del navegador (F12)
- Asegúrate que el servidor acepte CORS

**El juego no responde:**
- Verifica que JavaScript esté habilitado
- Prueba en modo incógnito
- Revisa la consola por errores

**Cooldown no funciona:**
- Verifica que localStorage esté disponible
- No uses modo incógnito (se borra al cerrar)

---

¡Listo para tu evento! 🎯
