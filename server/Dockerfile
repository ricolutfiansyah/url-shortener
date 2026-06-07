FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS development

COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE 3000
CMD [ "bun", "--watch", "src/index.ts" ]

FROM base AS production

COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]