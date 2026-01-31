FROM node:18-alpine
WORKDIR /app

# Copy package info and install
COPY frontend/package*.json ./
RUN npm install

# Copy frontend code AND the shared folder
COPY frontend/ .
COPY shared/ ./shared

EXPOSE 3000
CMD ["npm", "start"]