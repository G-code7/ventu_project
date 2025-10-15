# ==============================
# Etapa de desarrollo (Vite)
# ==============================
FROM node:18-alpine as development

WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de desarrollo de Vite
EXPOSE 5173

# Ejecutar servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
