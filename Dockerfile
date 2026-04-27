FROM node:20-alpine

# Installer git et openssh-client pour pouvoir cloner des repos privés si nécessaire
RUN apk add --no-cache git openssh-client bash

WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application Next.js
RUN npm run build

# Variable d'environnement pour la production
ENV NODE_ENV=production

# Exposer le port
EXPOSE 3000

# Lancer l'application Next.js
CMD ["npm", "start"]
