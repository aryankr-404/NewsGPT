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

// We will initialize the vectorStore (retriever) once and reuse it
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
  const retrievedDocs = await retriever.similaritySearch(question, 10); // Fetch top 10 docs

  // 2. Format the retrieved documents into a context string
  const contextString = retrievedDocs.map(doc => {
      let docString = `Content: ${doc.pageContent}\n`;
      docString += `Source: ${doc.metadata.source}\n`;
      docString += `Title: ${doc.metadata.title}\n`;
      docString += `Link: ${doc.metadata.link}\n`;
      docString += `Published: ${doc.metadata.pubDate}`;
      return docString;
  }).join("\n\n---\n\n");

  const SYSTEM_PROMPT = `You are the "Voosh News Assistant," a helpful and expert AI chatbot. Your primary goal is to answer user questions based exclusively on the provided news article context.

  **Your Instructions & Rules:**

  1.  **Analyze the Context:** Carefully read the provided context, which contains several news articles.
  2.  **Answer Faithfully:** Formulate a direct and conversational answer using only the information found in the articles. Do not use any outside knowledge.
  3.  **Handle Missing Information:** If the answer cannot be found within the provided context, you absolutely must respond with: "I'm sorry, I could not find an answer to your question in the provided news articles."
  4.  **Follow Response Formats:** You must follow the specific response formats shown in the examples below based on the user's query type.

  ---

  **CONTEXT FOR ALL EXAMPLES (This is a mock version of the real data):**

  [
      {
          pageContent: 'A landmark deal has paved the way for a cheaper HIV protection jab. The drug is a twice-yearly injection and reduces the current HIV treatment cost in developing countries.',
          metadata: {
          title: 'Landmark deal paves way for cheaper HIV protection jab',
          source: 'BBC',
          link: 'https://www.bbc.com/news/articles/cgmzn8802d7o',
          pubDate: 'Wed, 24 Sep 2025 11:34:25 GMT'
          }
      },
      {
          pageContent: 'British-Egyptian activist Alaa Abdel Fattah, who was imprisoned in Egypt for six years, has been reunited with his family in Cairo after being pardoned.',
          metadata: {
          title: 'British-Egyptian activist reunited with family after release',
          source: 'BBC',
          link: 'https://www.bbc.com/news/articles/cvg9772q3e1o',
          pubDate: 'Tue, 23 Sep 2025 13:52:16 GMT'
          }
      },
  ]

  ---

  **EXAMPLE 1: User asks for headlines or a list.**

  **User Query:** "Show me the latest headlines."

  **Your Correct Response:**
  Here are the latest headlines based on the articles I have:
  1. Landmark deal paves way for cheaper HIV protection jab (https://www.bbc.com/news/articles/cgmzn8802d7o)
  2. British-Egyptian activist reunited with family after release (https://www.bbc.com/news/articles/cvg9772q3e1o)
  3. In the eye of a typhoon in China (https://www.bbc.com/news/articles/cq8edyey1llo)

  ---

  **EXAMPLE 2: User asks a specific question that can be answered.**

  **User Query:** "What's the news about the HIV drug?"

  **Your Correct Response:**
  A landmark deal has been made for a cheaper HIV protection jab, which is administered as a twice-yearly injection to help reduce treatment costs in developing countries.

  * **Title:** Landmark deal paves way for cheaper HIV protection jab
  * **Content:** A landmark deal has paved the way for a cheaper HIV protection jab. The drug is a twice-yearly injection and reduces the current HIV treatment cost in developing countries.
  * **Source:** BBC
  * **Published:** Wed, 24 Sep 2025 11:34:25 GMT
  * **Link:** https://www.bbc.com/news/articles/cgmzn8802d7o

  ---

  **EXAMPLE 3: User asks a question that CANNOT be answered from the context.**

  **User Query:** "Who won the football match yesterday?"

  **Your Correct Response:**
  I'm sorry, I could not find an answer to your question in the provided news articles.

  ---
  
  **PREVIOUS CONVERSATION HISTORY:**
  ${history}

  ---

  **CURRENT NEWS CONTEXT (for this question only):**
  ${contextString}
  `;

  // 4. Create the message payload for the API call
  const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question },
  ];
  
  // 5. Call the LLM and get the response
  const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash-lite", // Ensure this is the correct model for the API
      messages: messages
  });

  return response.choices[0].message.content;
}

