FROM node:10-alpine

# Create and grant ownership of directories (optimized for efficiency)
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy package files
COPY /API/package*.json ./

# Handle database initialization script (if still needed)
# If no init script is required, remove this section:
COPY init.sql /docker-entrypoint-initdb.d/

USER node

# Install dependencies
RUN npm install

# Copy application code with ownership
COPY --chown=node:node /API/ ./

# Expose port
EXPOSE 3000

# Define environment variables (ensure correct key-value pairs)
ENV DB_NAME=WASH_DB \
    DB_USER=admin \
    DB_PASSWORD=admin \
    DB_HOST=postgres_svr \
    DB_PORT=5432 \
    NODE_ENV=development \
    RADIUS_IN_KM=-1 \
    WASHING_TIME_IN_MINUTES=60 \
    SGBD=postgres

# Start the application using CMD
CMD ["node", "index.js"]
