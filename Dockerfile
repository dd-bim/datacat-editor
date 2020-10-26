FROM node:lts-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

ENV REACT_APP_VERSION=""
ENV REACT_APP_TITLE="datacat Editor"
ENV REACT_APP_API=/graphql
ENV REACT_APP_MAIL=""

EXPOSE 3000
CMD ["npm", "start"]


