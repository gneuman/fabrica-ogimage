# La API de imágenes en un contenedor: docker build -t fabrica-og . && docker run -p 3000:3000 fabrica-og
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 CACHE_DIR=/app/.cache/og
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY motor ./motor
COPY servidor ./servidor
COPY public/muestras ./public/muestras
RUN mkdir -p /app/.cache/og && chown -R node:node /app/.cache
EXPOSE 3000
USER node
CMD ["node", "servidor/node.js"]
