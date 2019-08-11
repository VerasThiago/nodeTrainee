FROM node:10

ENV CONN mongo
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080:8080

CMD ["npm", "start"]

