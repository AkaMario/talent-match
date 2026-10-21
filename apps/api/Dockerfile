FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace apps/api --include-workspace-root
COPY apps/api apps/api
RUN npm run build --workspace apps/api
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node","apps/api/dist/main.js"]
