import express from "express";
import 'dotenv/config';
import { QdrantClient } from "@qdrant/js-client-rest";
import ingest from "../../scripts/ingest.js";

const router = express.Router();
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;

async function emptyCollection() {
  try {
    const client = new QdrantClient({ url: process.env.QDRANT_URL });

    console.log(`🧹 Deleting all points in collection "${QDRANT_COLLECTION_NAME}"...`);
    await client.delete({
      collection_name: QDRANT_COLLECTION_NAME,
      filter: {}, // empty filter = delete all points
    });
    console.log(`✅ Collection "${QDRANT_COLLECTION_NAME}" emptied.`);
  } catch (err) {
    console.error("❌ Failed to empty collection:", err);
    throw err;
  }
}

router.post("/", async (req, res) => {
  try {
    await emptyCollection();

    await ingest();

    res.status(200).json({ message: "✅ News updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update news.", details: err.message });
  }
});

export default router;
