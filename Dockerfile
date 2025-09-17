# # Base image
# FROM node:18

# # Set working directory
# WORKDIR /app

# # Copy package.json and install dependencies
# COPY package*.json ./
# RUN npm install --production

# # Copy rest of the code
# COPY . .

# # Expose port (same as your Node.js app)
# EXPOSE 3000

# # Start the server
# CMD ["npm", "start"]


# Stage 1: build
FROM node:18 AS builder
WORKDIR /app
# copy only package files first (cache layer)
COPY package*.json ./
RUN npm ci --production
# copy source
COPY . .

# Stage 2: runtime (smaller)
FROM node:18-slim
WORKDIR /app
# create non-root user (good practice)
RUN useradd --user-group --create-home --shell /bin/false appuser
# copy built app from builder
COPY --from=builder /app /app
# change ownership
RUN chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

# Optional healthcheck (container will report unhealthy on failure)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
