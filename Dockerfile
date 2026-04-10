# Use Node.js as the base image
FROM node:20-slim as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the React frontend
RUN npm run build

# Stage 2: Run the server
FROM node:20-slim

WORKDIR /app

# Copy only the necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/core ./core
COPY --from=builder /app/prompts ./prompts
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port GCP expects
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
