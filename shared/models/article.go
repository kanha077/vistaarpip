
package models

type Article struct {
	ID                string `json:"id"`
	Title             string `json:"title"`
	Tag               string `json:"tag"`
	Label             string `json:"label"`
	Excerpt           string `json:"excerpt"`
	Content           string `json:"content"`
	Author            string `json:"author"`
	Date              string `json:"date"`
	ReadTime          string `json:"readTime"`
	Img               string `json:"img"`
	Body              string `json:"body"`
	HomepagePlacement string `json:"homepagePlacement"`
}

