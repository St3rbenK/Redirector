# Stage 1: Build Frontend
FROM node:22-alpine AS build-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npx vite build

# Stage 2: Run Backend and Serve Frontend
FROM node:22-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY backend/ ./backend/

# FIX: Copy built frontend to the CORRECT backend public folder
# backend/src/index.js looks for '../public' relative to 'src', which is 'backend/public'
COPY --from=build-frontend /app/frontend/dist ./backend/public

WORKDIR /app/backend

# In Dokploy, run seed + start
CMD ["sh", "-c", "npm run seed && npm start"]

EXPOSE 3000
