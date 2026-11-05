# ==============================================================================
# Production Dockerfile for Node.js Application
# Optimized with Alpine Linux, Non-Root Security, and Healthcheck
# ==============================================================================

FROM node:20-alpine

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Set working directory
WORKDIR /app

# Ensure non-root node user owns the working directory
RUN chown -R node:node /app

# Copy dependency manifests first for optimal Docker layer caching
COPY --chown=node:node package*.json ./

# Install production dependencies cleanly
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code with non-root ownership
COPY --chown=node:node . .

# Switch to non-root user for security best practices
USER node

# Expose server port
EXPOSE 5000

# Container Healthcheck (Docker Engine verifies app status)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:5000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
