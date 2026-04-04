# 1️⃣ Base image
FROM node:20-alpine

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ Copy package files first (for caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy rest of the backend code
COPY . .

# 6️⃣ Expose backend port
EXPOSE 8080

# 7️⃣ Start the server
CMD ["node", "index.js"]
