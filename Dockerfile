FROM node:lts-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY .env ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

ENV REACT_APP_API=/graphql

EXPOSE 3000
CMD ["npm", "start"]


