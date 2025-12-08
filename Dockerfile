# Multi-stage build for BLACK RANGER Identity Vault

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Backend with frontend
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy backend code
COPY server/ ./

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ./public

# Generate RSA keys if they don't exist
RUN mkdir -p keys && \
    if [ ! -f keys/private_key.pem ]; then \
        node scripts/generate_keys.js; \
    fi

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["sh", "-c", "npm run migrate && npm start"]

