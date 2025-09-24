import Parser from "rss-parser";
const parser = new Parser();

export default async function fetchArticles() {
  try {
    console.log("Fetching BBC feed...");
    const feed = await parser.parseURL("http://feeds.bbci.co.uk/news/world/rss.xml");

    if (feed?.items) {
      const articles = feed.items.slice(0, 20).map(item => ({
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

// Example of how to run the function and see the detailed output
async function run() {
    const top20Articles = await fetchArticles();

    if (top20Articles.length > 0) {
        console.log("\n--- Printing detailed properties for each article ---");

        // =======================================================
        // This loop now prints every property for each article
        // =======================================================
        top20Articles.forEach((article, index) => {
            console.log(`\n--- Article ${index + 1} ---`);
            console.log(`  Source: ${article.source}`);
            console.log(`  Title: ${article.title}`);
            console.log(`  Description: ${article.description}`);
            console.log(`  Link: ${article.link}`);
            console.log(`  Publication Date: ${article.pubDate}`);
        });
        // =======================================================
    }
}

// run();