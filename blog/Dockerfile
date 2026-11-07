# Build context is the repository root, because the posts live in ../content:
#   docker build -f blog/Dockerfile .
FROM node:22-alpine@sha256:0e1754758c2df4cfa3e68d59e2e1b7374bb7fd9ea6328eaaacf15cc934af8202 AS build
WORKDIR /app
COPY blog/package*.json blog/
RUN cd blog && npm ci
COPY blog blog
COPY content content
RUN cd blog && npm run build

FROM nginx:alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11
COPY blog/nginx.conf /etc/nginx/conf.d/default.conf
COPY blog/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/blog/dist /usr/share/nginx/html
EXPOSE 80
