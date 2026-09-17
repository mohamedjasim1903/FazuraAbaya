# Stage 1: Build Angular application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx ng build --configuration production


# Stage 2: Serve Angular application using Nginx
FROM nginx:alpine

COPY --from=build /app/dist/fazura-abaya/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]