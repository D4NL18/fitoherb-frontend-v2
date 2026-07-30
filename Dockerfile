# Stage 1: Build the Angular app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code and build
# Copy the rest of the source code and build
COPY . .
ARG CONFIGURATION=production
RUN npm run build -- --configuration ${CONFIGURATION}

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the custom Nginx config to listen on 8080 (Cloud Run requirement)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular files to Nginx's serve directory
# IMPORTANT: adjust "fitoherb-frontend-v2" if your angular.json outputs to a different folder inside dist/
COPY --from=builder /app/dist/fitoherb-frontend-v2/browser /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

# Install tools for Basic Auth (htpasswd)
RUN apk add --no-cache apache2-utils

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
