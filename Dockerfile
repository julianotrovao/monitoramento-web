FROM node:18-slim

# Install ping utility
RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . /app

EXPOSE 3000

CMD ["node", "src/index.js"]