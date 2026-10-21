# ==========================================
# Stage 1 - Build React application
# ==========================================

FROM node:24-alpine AS build

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==========================================
# Stage 2 - Nginx runtime
# ==========================================

FROM nginx:alpine

RUN apk update && apk upgrade --no-cache

COPY --from=build /usr/app/build/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
