# ==========================================
# Stage 1: Build React application
# ==========================================

FROM node:24-alpine AS build

WORKDIR /usr/app

ENV REACT_APP_BACKEND_BASE_URL=http://backend:5000

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==========================================
# Stage 2: Nginx production runtime
# ==========================================

FROM nginx:alpine

RUN apk update && apk upgrade --no-cache

COPY --from=build /usr/app/build/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



