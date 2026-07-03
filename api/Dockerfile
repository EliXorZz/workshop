FROM node:20-alpine

# Outils nécessaires à la compilation de better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Le dossier data (SQLite) sera monté en volume
RUN mkdir -p /app/data

EXPOSE 3001

# Migration puis démarrage du serveur
CMD ["sh", "-c", "node src/db/migrate.js && node server.js"]
