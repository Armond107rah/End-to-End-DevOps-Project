FROM node:24-alpine3.24 AS dependencies

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci --omit=dev


FROM node:24-alpine3.24

WORKDIR /usr/app

RUN apk update && apk upgrade --no-cache

COPY --from=dependencies /usr/app/node_modules ./node_modules

COPY . .

RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm \
    && rm -f /usr/local/bin/npx

EXPOSE 5000

CMD ["node", "server.js"]
