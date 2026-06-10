package processor

import (
	"testing"
	"vistarago/shared/models"
)

func TestTransformArticle(t *testing.T) {
	// Test case 1: Headline is provided
	raw1 := models.RawArticle{
		Headline: "Breaking News: Go is Awesome",
		Content:  "Go is an open-source programming language supported by Google.",
		Category: "Tech",
		Source:   "TechNews",
	}

	art1 := TransformArticle(raw1)
	if art1.Title != "Breaking News: Go is Awesome" {
		t.Errorf("Expected Title to be 'Breaking News: Go is Awesome', got '%s'", art1.Title)
	}
	if art1.Content != raw1.Content {
		t.Errorf("Expected Content to be preserved, got '%s'", art1.Content)
	}
	if art1.Tag != "Tech" {
		t.Errorf("Expected Tag to be 'Tech', got '%s'", art1.Tag)
	}

	// Test case 2: Title is provided, Headline is empty (fallback check)
	raw2 := models.RawArticle{
		Title:    "Vistarago Launch",
		Content:  "The new dashboard is live.",
		Category: "General",
		Source:   "Internal",
	}

	art2 := TransformArticle(raw2)
	if art2.Title != "Vistarago Launch" {
		t.Errorf("Expected Title fallback to be 'Vistarago Launch', got '%s'", art2.Title)
	}
}

func TestProcessArticle(t *testing.T) {
	art := models.Article{
		Title: "Test",
		Label: "Feature",
	}

	processed := ProcessArticle(art)
	if processed.Label != "Verified" {
		t.Errorf("Expected Label to be 'Verified', got '%s'", processed.Label)
	}
}
