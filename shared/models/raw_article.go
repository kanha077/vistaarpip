package models

type RawArticle struct {
	Headline string `json:"headline"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Category string `json:"category"`
	ImageURL string `json:"image_url"`
	Source   string `json:"source"`
}