FROM golang:1.26-alpine

WORKDIR /app

COPY . .

RUN go mod tidy

RUN go build -o api-server ./api

EXPOSE 8080

CMD ["./api-server"]