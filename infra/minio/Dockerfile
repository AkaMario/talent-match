# Código oficial fijado a una versión; no usa imágenes de MinIO republicadas.
FROM golang:1.24-alpine AS build
WORKDIR /src
ADD https://codeload.github.com/minio/minio/tar.gz/refs/tags/RELEASE.2025-09-07T16-13-09Z /tmp/minio.tar.gz
RUN tar -xzf /tmp/minio.tar.gz --strip-components=1 -C /src
RUN CGO_ENABLED=0 GOMAXPROCS=2 go build -p 2 -trimpath -ldflags='-s -w' -o /minio .
FROM alpine:3.22
RUN adduser -D -u 10001 minio && mkdir /data && chown minio /data
COPY --from=build /minio /usr/local/bin/minio
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /src/LICENSE /LICENSE
USER minio
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
