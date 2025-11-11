import express from "express";
import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";
import ingest from "../../scripts/ingest.js";

const router = express.Router();
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

async function emptyCollection() {
  try {
    const client = new QdrantClient({ 
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY
    });

    // Fetch all existing collections
    const collections = await client.getCollections();
    const collectionNames = collections.collections.map((c) => c.name);

    if (collectionNames.includes(QDRANT_COLLECTION_NAME)) {
      await client.deleteCollection(QDRANT_COLLECTION_NAME);
      console.log(`✅ Collection '${QDRANT_COLLECTION_NAME}' deleted successfully.`);
    } else {
      console.log(`ℹ️ Collection '${QDRANT_COLLECTION_NAME}' does not exist. Skipping deletion.`);
    }

    // Display remaining collections
    const updatedCollections = await client.getCollections();
    console.log("📂 Available collections:", updatedCollections);
  } catch (err) {
    console.error("❌ Failed to delete collection:", err);
    throw err;
  }
}

router.post("/", async (req, res) => {
  try {
    console.log("🚀 Refreshing news collection...");
    await emptyCollection();

    await ingest(); // Re-scrape and store new embeddings

    res.status(200).json({ message: "✅ News updated successfully." });
  } catch (err) {
    console.error("❌ Error in refresh route:", err);
    res.status(500).json({ error: "❌ Failed to update news.", details: err.message });
  }
});

export default router;
