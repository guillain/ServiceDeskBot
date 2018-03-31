FROM node:alpine
EXPOSE 3333

RUN apk add -U ca-certificates \
  && rm -rf /var/cache/apk/*

ADD ./app /app
WORKDIR /app

COPY ./app/package*.json ./
RUN npm install
COPY ./app .

RUN npm install -g httpster
CMD [ "httpster" ]

