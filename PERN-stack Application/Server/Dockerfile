FROM node:24-alpine

WORKDIR /usr/app

RUN apk upgrade --no-cache

COPY package*.json ./

RUN npm install \
    && npm install -g npm@latest pm2@latest  

COPY  . .

EXPOSE 5000

CMD ["pm2", "start", "server.js", "--name", "Zal-App-Backend", "--no-daemon"]
