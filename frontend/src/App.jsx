import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articles, setArticles] = useState([]);

  const API_URL = "http://localhost:8080";

  async function fetchArticles() {
    try {

      const res = await axios.get(`${API_URL}/articles`);

      setArticles(res.data.articles || []);

    } catch (err) {
      console.error(err);
    }
  }

  async function submitArticle(e) {

    e.preventDefault();

    try {

      await axios.post(`${API_URL}/submit`, {
        title,
        content,
      });

      setTitle("");
      setContent("");

      fetchArticles();

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {

    fetchArticles();

    const interval = setInterval(fetchArticles, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Vistaar News Dashboard
        </h1>

        <form
          onSubmit={submitArticle}
          className="bg-white p-6 rounded-xl shadow mb-8"
        >

          <h2 className="text-2xl font-semibold mb-4">
            Submit Article
          </h2>

          <input
            type="text"
            placeholder="Title"
            className="w-full border p-3 rounded mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Content"
            className="w-full border p-3 rounded mb-4 h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            className="bg-black text-white px-6 py-3 rounded"
          >
            Submit
          </button>

        </form>

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-2xl font-semibold mb-4">
            Processed Articles
          </h2>

          <div className="space-y-4">

            {articles.map((article) => (

              <div
                key={article.id}
                className="border rounded p-4"
              >

                <h3 className="text-xl font-bold">
                  {article.title}
                </h3>

                <p className="text-gray-700 mt-2">
                  {article.content}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}