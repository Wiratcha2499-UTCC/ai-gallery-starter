# Stage 1: Build React frontend
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Install backend dependencies
FROM node:22-alpine AS server-builder
WORKDIR /server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .

# Stage 3: Final image — nginx + Node.js
FROM nginx:alpine
RUN apk add --no-cache nodejs
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=server-builder /server /server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]
