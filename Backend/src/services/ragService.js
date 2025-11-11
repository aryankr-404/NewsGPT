import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { prompt } from "../utils/prompt.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 1,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

const retriever = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: process.env.QDRANT_COLLECTION_NAME || "rag_news_articles",
});

const promptTemplate = prompt;

function extractHeadingsFromMarkdown(markdownText) {
  // This regex captures text inside **...** optionally followed by a colon
  // and works even if it’s inside bullets or has spaces before it.
  const headingRegex = /(?:\*+\s*)?\*\*(.*?)\*\*:?/g;

  const headings = [];
  let match;

  while ((match = headingRegex.exec(markdownText)) !== null) {
    const heading = match[1].trim();

    // Filter out generic section titles like "Sports News Updates"
    if (
      heading &&
      !/^news updates$/i.test(heading) &&
      !/summary/i.test(heading) &&
      heading.length > 2
    ) {
      headings.push(heading);
    }
  }

  return headings;
}

// --- Main Service Function ---
export async function getAiResponse(question, history) {
  console.log("Backend retriving from Qdrant...");

  const lastAssistant = history.length ? JSON.parse(history[0]) : null;

  let headlineDocs = [];
  if (lastAssistant && lastAssistant.role === "assistant" && lastAssistant.content) {
    const headings = extractHeadingsFromMarkdown(lastAssistant.content);
    console.log("Extracted Headings:", headings);

    for (const heading of headings) {
      try {
        // Fetch one relevant doc for each heading
        const docs = await retriever.similaritySearch(heading, 1);
        headlineDocs.push(...docs);
      } catch (err) {
        console.error("Error retrieving for heading:", heading, err);
      }
    }
  }

  const lastChatContext = headlineDocs.length ? headlineDocs
        .map((doc) => {
          return `description: ${doc.pageContent}
            Title: ${doc.metadata.title}
            Link: ${doc.metadata.link}
            Published: ${doc.metadata.published}`;
        })
        .join("\n\n---\n\n")
    : "No previous headlines context available.";


  const retrievedDocs = await retriever.similaritySearch(question, 3);

  const contextString = retrievedDocs
    .map((doc) => {
      let docString = `description: ${doc.pageContent}\n`;
      docString += `Source: ${doc.metadata.source}\n`;
      docString += `Title: ${doc.metadata.title}\n`;
      docString += `Link: ${doc.metadata.link}\n`;
      docString += `Published: ${doc.metadata.published}`;
      return docString;
    })
    .join("\n\n---\n\n");
  //   console.log(contextString);

  const formattedPrompt = await promptTemplate.invoke({
    contextString: contextString,
    lastChatContext: lastChatContext
  });
  const SYSTEM_PROMPT = formattedPrompt.value;
  // console.log(SYSTEM_PROMPT);

  let messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: question }
  ];

  console.log("LLM invoking started...");

  const response = await llm.invoke(messages);
  return response.content;
}
