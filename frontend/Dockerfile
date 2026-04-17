FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["sh", "-c", "sed -i 's/listen       80;/listen       ${PORT};/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]