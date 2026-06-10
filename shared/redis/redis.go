package redisclient

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

func getRedisAddress() string {

	host := os.Getenv("APP_REDIS_HOST")
	port := os.Getenv("APP_REDIS_PORT")

	if host == "" {
		host = "localhost"
	}

	if port == "" {
		port = "6379"
	}

	return fmt.Sprintf("%s:%s", host, port)
}

var Client = redis.NewClient(&redis.Options{
	Addr: getRedisAddress(),
})