package processor

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"vistarago/shared/models"
	redisclient "vistarago/shared/redis"

	"github.com/google/uuid"
)

func TransformArticle(raw models.RawArticle) models.Article {

	title := raw.Headline
	if title == "" {
		title = raw.Title
	}

	excerpt := raw.Content

	if len(excerpt) > 120 {
		excerpt = excerpt[:120] + "..."
	}

	body := fmt.Sprintf(
		"<h3>%s</h3><p>%s</p>",
		title,
		raw.Content,
	)

return models.Article{
	ID:                uuid.New().String(),
	Title:             title,
	Tag:               raw.Category,
	Label:             "Feature",
	Excerpt:           excerpt,
	Author:            raw.Source,
	Date:              time.Now().Format("Jan 2, 2006"),
	ReadTime:          calculateReadTime(raw.Content),
	Img:               raw.ImageURL,
	Body:              body,
	HomepagePlacement: "hero",
}

}

func calculateReadTime(content string) string {

	wordCount := len(strings.Fields(content))

	minutes := wordCount / 200

	if minutes < 1 {
		minutes = 1
	}

	return fmt.Sprintf("%d min read", minutes)
}

func ProcessArticle(article models.Article) models.Article {
	article.Label = "Verified"
	return article
}

func SaveProcessedArticle(article models.Article) error {
	articleJSON, err := json.Marshal(article)
	if err != nil {
		return err
	}

	err = redisclient.Client.RPush(
		redisclient.Ctx,
		"processed_articles",
		articleJSON,
	).Err()
	if err != nil {
		return err
	}

	return SaveArticleToFile(article)
}

func SaveArticleToFile(article models.Article) error {
	articleJSON, err := json.MarshalIndent(article, "", "  ")
	if err != nil {
		return err
	}

	dir := "data"
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	filename := fmt.Sprintf("%s/article-%s.json", dir, article.ID)
	return os.WriteFile(filename, articleJSON, 0644)
}