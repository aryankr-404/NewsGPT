import 'dotenv/config'; 
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import fetchArticles from "./news.js"; 

const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

export default async function ingest() {
  try {
    // 1. Fetch articles using your existing function
    const articles = await fetchArticles();
    if (!articles || articles.length === 0) {
      console.log("No articles fetched. Exiting ingestion process.");
      return;
    }
    console.log(`✅ Fetched ${articles.length} articles.`);

    // 2. Create LangChain Document objects
    const documents = articles.map(
      (article) =>
        new Document({
          // The pageContent is what gets embedded into a vector
          pageContent: `${article.description}`,
          // The metadata is stored alongside the vector
          metadata: {
            source: article.source,
            link: article.link,
            title: article.title,
            pubDate: article.pubDate,
          },
        })
    );

    // 3. Initialize the embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "embedding-001",
    });

    // 4. Create and store the embeddings in Qdrant
    console.log("🚀 Starting ingestion into Qdrant...");
    await QdrantVectorStore.fromDocuments(documents, embeddings, {
      apiKey: QDRANT_API_KEY,
      url: process.env.QDRANT_URL,
      collectionName: QDRANT_COLLECTION_NAME,
    });

    console.log(`✅ Successfully ingested ${documents.length} articles into the "${QDRANT_COLLECTION_NAME}" collection.`);

  } catch (err) {
    console.error("❌ Ingestion failed:", err);
  }
}

ingest();