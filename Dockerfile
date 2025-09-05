# stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

# copy package + lock first for better cache behavior
COPY package.json package-lock.json ./
RUN npm ci --silent

# copy rest and build
COPY . .
RUN npm run build

# stage 2: nginx
FROM nginx:stable-alpine
# optional: remove default config first (nginx image already uses /etc/nginx/conf.d/default.conf)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (make sure file exists at project root)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
