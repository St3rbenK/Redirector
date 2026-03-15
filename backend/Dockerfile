FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Dokploy optimization: auto-seed on every start (it only creates if doesn't exist)
CMD ["sh", "-c", "npm run seed && npm start"]

EXPOSE 3001
