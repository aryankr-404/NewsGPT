import Parser from "rss-parser";
import striptags from "striptags";

const parser = new Parser();

export default async function fetchArticles() {
  try {
    console.log("Fetching News feed...");
    const feed = await parser.parseURL("https://www.theguardian.com/world/rss");

    if (feed?.items) {
      const articles = feed.items.slice(0, 50).map(item => ({
        source: "The Guardian",
        title: item.title ?? "No Title",
        description: striptags(item.content) ?? item.description ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
      }));

      console.log(`✅ Successfully fetched and normalized ${articles.length} articles from The Guardian.`);
      return articles;
    } else {
      console.warn("⚠️ BBC feed did not return any items.");
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching the BBC feed:", error);
    return [];
  }
}

// fetchArticles();