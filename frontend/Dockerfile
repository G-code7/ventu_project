# Etapa de desarrollo
FROM node:18-alpine as development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

# 🔥 CORRECCIÓN: Instalar TODAS las dependencias (no solo production)
RUN npm ci

COPY . .

# Build para producción
RUN npm run build

# Etapa final - Servir con nginx
FROM nginx:alpine as production

# Copiar los archivos built
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]