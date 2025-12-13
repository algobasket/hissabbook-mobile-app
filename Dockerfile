# Mobile Web App Dockerfile
FROM node:20-alpine

# Install necessary packages for Next.js
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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
