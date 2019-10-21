FROM node:lts-alpine

WORKDIR /app
RUN npm install -g @angular/cli

COPY . /app

RUN npm install

ENTRYPOINT ng serve --host 0.0.0.0 --port 4201 --proxy-config proxy.config.json

EXPOSE 4201