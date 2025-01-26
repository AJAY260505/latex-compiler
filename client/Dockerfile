FROM node:18-alpine

WORKDIR /app
COPY package*.json ./

# Install both dependencies and devDependencies
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

CMD ["npm", "start"]