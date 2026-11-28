# Build context is the repository root, because the posts live in ../content:
#   docker build -f blog/Dockerfile .
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS build
WORKDIR /app
COPY blog/package*.json blog/
RUN cd blog && npm ci
COPY blog blog
COPY content content
RUN cd blog && npm run build

FROM nginx:alpine@sha256:7fc0fb4af7bf006aeb31aea88069976060f8f0a0a86b667126742cc17f4e31ae
COPY blog/nginx.conf /etc/nginx/conf.d/default.conf
COPY blog/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/blog/dist /usr/share/nginx/html
EXPOSE 80
