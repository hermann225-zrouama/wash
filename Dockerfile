FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY /API/package*.json ./
COPY init.sql /docker-entrypoint-initdb.d/

USER node

RUN npm install 

COPY --chown=node:node /API/ ./

EXPOSE 3000

ENV HOST=0.0.0.0 PORT=3000

CMD ["node", "index.js"]
