FROM node:20-alpine
WORKDIR /app
COPY package*json ./
RUN npm install
COPY . .
EXPOSE 4518
CMD ["node", "server.js"]