package main

import (
	"encoding/json"
	"fmt"
	"time"

	"vistarago/shared/models"
	redisclient "vistarago/shared/redis"
	"vistarago/worker/processor"
)

func worker(workerID int) {

	fmt.Printf("Worker %d started\n", workerID)

	for {

		result, err := redisclient.Client.BRPop(
			redisclient.Ctx,
			0,
			"news_queue",
		).Result()

		if err != nil {
			fmt.Printf("Worker %d queue error: %v\n", workerID, err)
			continue
		}

		jobData := result[1]

		var article models.Article

		err = json.Unmarshal([]byte(jobData), &article)
		if err != nil {
			fmt.Printf("Worker %d JSON error: %v\n", workerID, err)
			continue
		}

		fmt.Printf(
			"Worker %d processing: %s\n",
			workerID,
			article.Title,
		)

		time.Sleep(2 * time.Second)

		processed := processor.ProcessArticle(article)

		err = processor.SaveProcessedArticle(processed)
		if err != nil {
			fmt.Printf("Worker %d save error: %v\n", workerID, err)
			continue
		}

		fmt.Printf(
			"Worker %d completed: %s\n",
			workerID,
			article.Title,
		)
	}
}

func main() {

	fmt.Println("Starting worker pool...")

	numberOfWorkers := 3

	for i := 1; i <= numberOfWorkers; i++ {
		go worker(i)
	}

	select {}
}