# Gunakan image node paling ringan
FROM node:18-alpine

# Buat folder kerja
WORKDIR /app

# Salin file dependencies dan install
COPY package*.json ./
RUN npm install

# Salin seluruh project
COPY . .

# Buka port
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
