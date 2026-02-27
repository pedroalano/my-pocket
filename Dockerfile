FROM node:22-slim AS dependencies

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate


FROM dependencies AS build

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
RUN npm run build


FROM dependencies AS development

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

EXPOSE 3000
CMD ["npm", "run", "start:dev"]


FROM node:22-slim AS production

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start:prod"]