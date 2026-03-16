FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve concurrently
EXPOSE 3000
EXPOSE 3001
CMD ["sh", "-c", "node server.js & serve -s build -l 3000"]
