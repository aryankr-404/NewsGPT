import 'dotenv/config';
import OpenAI from "openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

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

  const SYSTEM_PROMPT = `You are the "Voosh News Assistant". Follow these steps before answering:

  === THINKING STEPS ===
  1. Carefully read and understand the user's query.
  2. Decide if the query is related to news articles.
    - If it is NOT news-related, respond using ASK_CLARIFICATION schema.
  3. If it IS news-related:
    a) Determine which article(s) the user refers to.
        - If the user mentions a previous explanation, focus on PREVIOUS_CONVERSATION (last AI response).
        - If the user asks a new query, focus on CURRENT_NEWS_CONTEXT (retrieved from vector database).
    b) Choose the most relevant schema (HEADLINES, DETAILED, SUMMARY).
  4. Generate the JSON response in the selected schema, keeping it concise (1–3 sentences) and engaging with emojis.
  5. Always cite sources from the provided context.
  6. Do NOT invent news or hallucinate content.

  === SCHEMAS ===

  (HEADLINES)
  {
    "type": "headlines",
    "text": "<engaging intro about the listed news, add emojis>",
    "items": [
        { "title":"...", "link":"...", "source":"...", "pubDate":"..." }
    ]
  }

  (DETAILED)
  {
    "type": "detailed",
    "text":"<summary or elaboration of the specific article, include emojis>",
    "article": { "title":"...", "content":"...", "source":"...", "published":"...", "link":"..." }
  }

  (SUMMARY)
  {
    "type":"summary",
    "text":"<overview of multiple articles, add emojis>",
    "highlights":[ { "title":"...", "summary":"...", "link":"..." } ]
  }

  (ASK_CLARIFICATION)
  {
    "type":"ask_clarification",
    "text":"🤔 I'm not sure which news article you mean. Could you clarify or select one from recent news?"
  }

  === INPUTS ===
  - PREVIOUS_CONVERSATION: ${history} // Only the last AI response
  - CURRENT_NEWS_CONTEXT: ${contextString}   // Articles retrieved from vector database`


  // 4. Create the message payload for the API call
  const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question },
  ];
  
  // 5. Call the LLM and get the response
  const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash-lite", // Ensure this is the correct model for the API
      messages: messages,
      temperature: 0.7,
  });
  const responseText = response.choices[0].message.content;
  // console.log(responseText);
  const jsonResponse = extractJson(responseText);
  console.log(jsonResponse);
  // return jsonResponse;

}

