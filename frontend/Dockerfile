# Usar una imagen oficial de Node.js como base
# Alpine es una versión muy ligera, ideal para contenedores
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (o yarn.lock)
# Lo hacemos por separado para aprovechar el caché de Docker
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que Vite usa por defecto
EXPOSE 5173

# El comando para iniciar el servidor de desarrollo de Vite
# El host 0.0.0.0 es necesario para que sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
