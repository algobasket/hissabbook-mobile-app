# Mobile Web App Dockerfile
FROM node:20-alpine

# Install necessary packages for Next.js
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package*.json ./

# Install dependencies with increased timeout and retries
RUN npm ci --prefer-offline --no-audit || \
    (npm cache clean --force && npm ci --prefer-offline --no-audit)

# Copy source code
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application (for web deployment, not static export)
RUN npm run build

# Expose port
EXPOSE 3002

# Set environment variables
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
