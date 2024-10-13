FROM node:18

WORKDIR /src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
