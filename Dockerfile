# Development stage
FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

# Build stage
FROM development AS build

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node

CMD [ "node", "dist/main.js" ]
