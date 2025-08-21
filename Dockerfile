FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN npm ci && npm cache clean --force

COPY src/ ./src/

RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p logs && chown -R nestjs:nodejs logs

USER nestjs
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/config?appVersion=13.6.956&platform=android || exit 1

EXPOSE 3000

CMD ["node", "dist/index"]
