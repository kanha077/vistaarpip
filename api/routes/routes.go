package routes

import (
	"vistarago/api/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.POST("/submit", handlers.SubmitArticle)
	router.GET("/articles", handlers.GetArticles)
}