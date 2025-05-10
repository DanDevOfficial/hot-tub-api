const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hot Tub API is running.");
});

app.get("/pornhub", async (req, res) => {
  try {
    const data = await fetchVideos("https://www.pornhub.com/video", "pornhub");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Pornhub videos" });
  }
});

app.get("/youporn", async (req, res) => {
  try {
    const data = await fetchVideos("https://www.youporn.com/", "youporn");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch YouPorn videos" });
  }
});

async function fetchVideos(url, source) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const videos = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");
    const title = $(el).attr("title") || $(el).text().trim();
    const thumb = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");

    if (href && title && href.includes("/view")) {
      videos.push({
        title,
        thumbnail: thumb || null,
        videoUrl: url.includes("pornhub")
          ? "https://www.pornhub.com" + href
          : "https://www.youporn.com" + href,
        duration: null,
        source
      });
    }
  });

  return videos.slice(0, 10);
}

app.listen(PORT, () => {
  console.log(`Hot Tub API running at http://localhost:${PORT}`);
});
