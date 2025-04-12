# Build stage for frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy built frontend assets
COPY --from=frontend-build /app/dist ./public

# Setup backend
WORKDIR /app/backend
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/package.json ./package.json
COPY --from=backend-build /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Copy startup script
WORKDIR /app
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

# Start the application
CMD ["./docker-entrypoint.sh"] 