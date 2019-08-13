FROM node:10

ENV CONN "172.21.55.122"
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080:8080

CMD ["npm", "start"]

