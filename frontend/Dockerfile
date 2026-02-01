FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --silent --no-audit --no-fund
COPY . .
EXPOSE 5173
CMD ["npm","run","frontend:dev"]