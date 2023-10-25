FROM node:20-alpine as build
RUN corepack enable

RUN apk add alpine-sdk python3

WORKDIR /app
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY package.json .
COPY yarn.lock .
RUN yarn install --inline-builds

COPY tsconfig.json .
COPY src src
RUN yarn build

FROM node:20-alpine
RUN corepack enable

WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/.pnp.cjs ./
COPY --from=build /app/.pnp.loader.mjs ./
COPY --from=build /app/.yarn ./.yarn
COPY --from=build /app/build ./build

ENV DIR=/music
ENV STORE=/store
ENV TELEGRAM_API_BASE=https://api.telegram.org

CMD node -r ./.pnp.cjs build/index.js
