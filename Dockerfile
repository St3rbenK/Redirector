# Stage 1: Build Frontend
FROM node:22-alpine AS build-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
# Use --legacy-peer-deps to avoid issues with React 19 and older type definitions
RUN npm install --legacy-peer-deps

COPY frontend/ ./
# Build with type checking disabled to speed up and avoid build-blocking type warnings
RUN npm run build

# Stage 2: Run Backend and Serve Frontend
FROM node:22-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend to backend's public folder
COPY --from=build-frontend /app/frontend/dist ./public

WORKDIR /app/backend

# In Dokploy, run seed + start
CMD ["sh", "-c", "npm run seed && npm start"]

EXPOSE 3000
