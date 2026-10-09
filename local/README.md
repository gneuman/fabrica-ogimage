# local/

Tus imágenes. Todo aquí, salvo este archivo, queda fuera de git: el repo es
público y guarda la herramienta, no las fotos.

- `inbox/`: lo que llega para hacer imágenes: fotos de personas, logos, referencias.
  Las fotos de personas se pasan sin fondo: `npm run sinfondo -- local/inbox/ana.png`.
- `hechas/AAAA-MM-DD-<plantilla>-<nombre>/`: lo que se genera, un PNG por tamaño.
  Lo escribe `npm run probar -- <plantilla> campo=valor…`.

Para llevarlas a otro proyecto: `--salida ../otro-proyecto/public/og`.
