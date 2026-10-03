# Canvas compartido (desde tu PC)

No requiere cuenta ni instalar librerías. Solo necesitas Node.js (https://nodejs.org, versión LTS).

## Pasos
1. Descomprime la carpeta y abre una terminal dentro de ella.
2. Ejecuta: `node server.js`
3. Abre **http://localhost:3000** en el navegador de tu PC. Quien abre desde `localhost` es el administrador.
4. Pulsa **📱 QR** y pide a la gente que lo escanee con la cámara del celular. Deben estar en el mismo Wi-Fi que tu PC.

## Administrador (solo desde localhost)
- **🗑 Borrar**: toca cualquier dibujo o foto para eliminarlo.
- **Limpiar todo**: borra el lienzo completo.
- Los demás solo pueden deshacer lo suyo.

## Si los celulares no se conectan
- Windows pregunta si permites Node.js en redes privadas: acepta.
- Algunas redes (campus, cafés, "invitados") aíslan los dispositivos entre sí. Usa el Wi-Fi de tu casa o activa el punto de acceso de un celular y conecta el PC a él.
- Si tu IP cambia, vuelve a abrir el QR.

## Otros
- Los dibujos se guardan en `data.json`; bórralo (con el servidor apagado) para empezar de cero.
- Otro puerto: `PORT=8080 node server.js` (en Windows PowerShell: `$env:PORT=8080; node server.js`).
- Nada de esto es público en internet: solo funciona mientras tu PC tenga el servidor corriendo.

## Publicarlo en internet (GitHub + Render)
1. En github.com crea un repositorio y sube estos archivos (Add file > Upload files). `data.json` no se sube.
2. En render.com: New > Blueprint, elige el repositorio. Render lee `render.yaml`, crea el servicio y genera una variable `ADMIN_KEY`.
3. Cuando termine tendrás un enlace público `https://...onrender.com`. Ábrelo, pulsa **🔑 Admin** y escribe la clave (la ves en Render > Environment > ADMIN_KEY). Desde ahí aparecen Borrar, Limpiar todo y el QR del enlace público.
4. Plan gratis: el servicio se duerme sin visitas (tarda unos segundos en despertar) y **los dibujos se pierden al reiniciarse**, porque el disco no es permanente.
