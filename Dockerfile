FROM node:13.14.0-buster

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7000

RUN npm run build

RUN npm run webpack

RUN npm run migrate

CMD node build/main