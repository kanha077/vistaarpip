package handlers

import (
	"encoding/json"
	"net/http"

	"vistarago/shared/models"
	"vistarago/worker/processor"

	redisclient "vistarago/shared/redis"

	"github.com/gin-gonic/gin"
)

func SubmitArticle(c *gin.Context) {

	var raw models.RawArticle

	if err := c.ShouldBindJSON(&raw); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON",
		})

		return
	}

	// Transform raw input
	finalArticle := processor.TransformArticle(raw)

	// Save to Redis + file
	err := processor.SaveProcessedArticle(finalArticle)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Article transformed successfully",
		"article": finalArticle,
	})
}


func GetArticles(c *gin.Context) {

	// Fetch all processed articles
	articlesData, err := redisclient.Client.LRange(
		redisclient.Ctx,
		"processed_articles",
		0,
		-1,
	).Result()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Redis fetch failed",
		})

		return
	}

	var articles []models.Article

	// Convert Redis JSON strings back into structs
	for _, articleStr := range articlesData {

		var article models.Article

		err := json.Unmarshal([]byte(articleStr), &article)

		if err == nil {
			articles = append(articles, article)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"articles": articles,
	})
}
