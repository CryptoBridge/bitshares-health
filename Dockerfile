### BUILD
FROM node:10-alpine

WORKDIR /app
COPY --chown=node:node . .

RUN npm install --production && npm link

### BASE
EXPOSE 3000
USER node

ENTRYPOINT ["btshealth"]
