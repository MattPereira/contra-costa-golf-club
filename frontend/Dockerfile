FROM node:18.16

WORKDIR /code
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]