# Build context is the repository root, because the posts live in ../content:
#   docker build -f blog/Dockerfile .
FROM node:22-alpine@sha256:0e1754758c2df4cfa3e68d59e2e1b7374bb7fd9ea6328eaaacf15cc934af8202 AS build
WORKDIR /app
COPY blog/package*.json blog/
RUN cd blog && npm ci
COPY blog blog
COPY content content
RUN cd blog && npm run build

FROM nginx:alpine@sha256:fed7e14be83cbd2661a75cdc5b872d936cf155d46c327084d30b8df19ae88d72
COPY blog/nginx.conf /etc/nginx/conf.d/default.conf
COPY blog/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/blog/dist /usr/share/nginx/html
EXPOSE 80
