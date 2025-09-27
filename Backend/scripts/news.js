import Parser from "rss-parser";
const parser = new Parser();

export default async function fetchArticles() {
  try {
    console.log("Fetching BBC feed...");
    const feed = await parser.parseURL("http://feeds.bbci.co.uk/news/world/rss.xml");

    if (feed?.items) {
      const articles = feed.items.slice(0, 40).map(item => ({
        source: "BBC",
        title: item.title ?? "No Title",
        description: item.contentSnippet ?? item.description ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
      }));

      console.log(`✅ Successfully fetched and normalized ${articles.length} articles from BBC.`);
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
