FROM node:lts-alpine
WORKDIR /app

# Alpine Linux Fix für Rollup
RUN apk add --no-cache libc6-compat

COPY package.json ./
RUN npm install
COPY package-lock.json ./

COPY .env ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY src ./src
COPY public ./public
COPY index.html ./

ENV VITE_API_URL=/graphql

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]