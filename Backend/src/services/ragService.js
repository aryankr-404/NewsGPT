import 'dotenv/config';
import OpenAI from "openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

// --- Initialize Components (outside the function for efficiency) ---
// These are created once when the server starts, not on every API call.

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "embedding-001",
});

function extractJson(text) {
  if (!text || typeof text !== "string") return null;

  // 1. Remove common Markdown fences ```json ... ```
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")   // remove opening ```json
    .replace(/^```/, "")        // remove opening ```
    .replace(/```$/, "");       // remove closing ```

  // 2. Try parsing cleaned text
  try {
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error("❌ Failed to parse model JSON:", e.message);
    return {
      type: "error",
      text: "Model returned invalid JSON.",
      details: text
    };
  }
}

let retriever;

// --- Main Service Function ---
export async function getAiResponse(question, history) {
  // Initialize vector store on the first API call
  if (!retriever) {
    console.log("Connecting to Qdrant vector store for the first time...");
    retriever = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION_NAME || "rag_news_articles",
    });
    console.log("✅ Qdrant connection established.");
  }

  // 1. Retrieve relevant documents from Qdrant
  const retrievedDocs = await retriever.similaritySearch(question, 5); // Fetch top 5 docs

  // 2. Format the retrieved documents into a context string
  const contextString = retrievedDocs.map(doc => {
      let docString = `Content: ${doc.pageContent}\n`;
      docString += `Source: ${doc.metadata.source}\n`;
      docString += `Title: ${doc.metadata.title}\n`;
      docString += `Link: ${doc.metadata.link}\n`;
      docString += `Published: ${doc.metadata.pubDate}`;
      return docString;
  }).join("\n\n---\n\n");

  const SYSTEM_PROMPT = `You are the "Voosh News Assistant". Answer ONLY using the provided news article context and chat history.  

    === RULES ===
    1. Respond ONLY in valid JSON (no markdown or extra text).  
    2. Use one of these schemas:  

    (HEADLINES) when asked for headlines/list  
    {
      "type": "headlines",
      "text": "<short intro>",
      "items": [
          { "title":"...", "link":"...", "source":"...", "pubDate":"..." }
      ],
    }

    (DETAILED) for specific article questions  
    {
      "type": "detailed",
      "text":"<short summary>",
      "article":{ "title":"...", "content":"...", "source":"...", "published":"...", "link":"..." },
    } 

    (SUMMARY) when summarizing multiple articles  
    {
      "type":"summary",
      "text":"<short overview>",
      "highlights":[ { "title":"...", "summary":"...", "link":"..." } ],
    }

    (TIMELINE) when asked for sequence of events  
    {
      "type":"timeline",
      "text":"<short intro>",
      "events":[ { "date":"...", "title":"...", "description":"...", "link":"..." } ],
    }

    (NOT_FOUND) if context lacks answer  
    {
      "type":"not_found",
      "text":"I'm sorry, I could not find an answer in the provided articles.",
    }

    3. Always cite sources from context in source array.  
    4. If multiple views exist, include both. If ambiguous, return most relevant and note ambiguity.  
    5. Keep text short (1 to 3 sentences).  

    === INPUTS AVAILABLE ===
    - PREVIOUS_CONVERSATION: ${history}  
    - CURRENT_NEWS_CONTEXT: ${contextString}  

    Base answers strictly on CURRENT_NEWS_CONTEXT.  
    Return ONLY JSON in the schemas above.
  `;

  // 4. Create the message payload for the API call
  const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question },
  ];
  
  // 5. Call the LLM and get the response
  const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash-lite", // Ensure this is the correct model for the API
      messages: messages,

  });
  const responseText = response.choices[0].message.content;
  const jsonResponse = extractJson(responseText);
  return jsonResponse;
}

