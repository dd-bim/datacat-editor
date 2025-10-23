FROM node:lts-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY .env ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY src ./src
COPY public ./public
COPY index.html ./

ENV VITE_API_URL=/graphql
ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]