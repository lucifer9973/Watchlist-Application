FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm install

FROM deps AS build
WORKDIR /app
COPY tsconfig.base.json ./
COPY apps/backend apps/backend
RUN npm run db:generate --workspace apps/backend
RUN npm run build --workspace apps/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm install --omit=dev
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/backend/prisma apps/backend/prisma
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma node_modules/@prisma
EXPOSE 5000
CMD ["sh", "-c", "npm run db:migrate --workspace apps/backend && npm run start --workspace apps/backend"]
