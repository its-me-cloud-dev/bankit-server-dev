# # Use the official image as a parent image
# FROM node:alpine

# # Set the working directory
# WORKDIR /app

# # Copy the package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # Expose the port the app runs on
# EXPOSE 8080

# # Start the application
# CMD ["node", "server.js"]

# 1단계: 빌드 스테이지
FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# 2단계: 런타임 스테이지
FROM node:alpine

WORKDIR /app

# 빌드 단계에서 production dependencies만 복사
COPY --from=build /app /app

EXPOSE 8080

CMD ["node", "server.js"]
