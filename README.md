# NewsGPT: Real-Time News Summarization & Conversational RAG Platform

## Introduction

**NewsGPT** is a full-stack, production-ready platform that combines real-time news ingestion, advanced summarization, and conversational AI. It fetches the latest news from trusted sources, processes and summarizes them using a Large Language Model (LLM), and enables users to interact with the news through a chat interface. The system leverages Retrieval-Augmented Generation (RAG) to provide context-aware, up-to-date responses, and uses Redis for efficient user session management and chat history caching. User authentication is handled via Clerk, ensuring secure and persistent user experiences.

**Key Features:**

- Real-time news ingestion and multi-level summarization
- Conversational chat interface powered by LLMs
- Persistent, user-specific chat history using Redis
- Scalable backend with modular architecture
- Secure authentication with Clerk

---

## Backend Environment Variables

The backend requires the following environment variables to be set in a `.env` file:

| Variable                 | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `GEMINI_API_KEY`         | API key for the Gemini LLM provider              |
| `PORT`                   | Port for the Express server (default: 8080/3000) |
| `QDRANT_URL`             | URL for the Qdrant vector database instance      |
| `QDRANT_COLLECTION_NAME` | Name of the Qdrant collection for news articles  |
| `QDRANT_API_KEY`         | API key for authenticating with Qdrant           |
| `REDIS_PASSWORD`         | Password for the Redis instance                  |
| `REDIS_HOST_LINK`        | Host URL for the Redis instance                  |
| `REDIS_PORT`             | Port for the Redis instance                      |

Example `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
QDRANT_URL=https://your-qdrant-url:6333
QDRANT_COLLECTION_NAME=rag_news_articles
QDRANT_API_KEY=your-qdrant-api-key
REDIS_PASSWORD=your-redis-password
REDIS_HOST_LINK=your-redis-host
REDIS_PORT=your-redis-port
```

## Backend Architecture & Details

The backend is built with Node.js and Express, designed for modularity, scalability, and maintainability. It orchestrates news ingestion, LLM-powered summarization, semantic search, and user session management. Here’s a detailed breakdown:

### 1. Server Setup (`src/server.js`)

- **Express Initialization:** Sets up the Express app, configures CORS to allow all origins, and loads environment variables with `dotenv`.
- **Route Registration:** Registers all API endpoints for chat, news ingestion, and health checks.
- **Startup:** Listens on a configurable port (default: 8080 or as set in `.env`).

### 2. API Routes

#### `/api/chat` (POST)

- **Purpose:** Handles user chat messages.
- **Flow:**
  1. Receives `{ question, userId }` from the frontend.
  2. Fetches the user's chat history from Redis using the Clerk user ID as the key.
  3. Passes the question and history to the LLM pipeline for context-aware response generation.
  4. Appends both the user’s question and the AI’s answer to the Redis history list.
  5. Sets a TTL (24 hours) on the history key to manage memory and session expiry.
  6. Returns the AI’s answer to the frontend.

#### `/api/chat/history/:userId` (GET)

- **Purpose:** Retrieves the full chat history for a user from Redis, enabling persistent sessions.

#### `/update-news` (POST/GET)

- **Purpose:** Triggers ingestion of the latest news articles from RSS feeds (e.g., BBC).
- **Flow:**
  1. Fetches and normalizes articles using `rss-parser`.
  2. Converts articles into LangChain Document objects.
  3. Summarizes each article using the LLM pipeline (see below).
  4. Stores the processed articles in Qdrant for semantic search.

### 3. News Ingestion & Multi-Level Summarization Pipeline

- **RSS Fetching:** Uses `rss-parser` to pull news from sources like BBC.
- **Normalization:** Each article is normalized to a standard schema (source, title, description, link, pubDate).
- **Document Creation:** Articles are converted into LangChain Document objects for downstream processing.
- **LLM Summarization:**
  - Each article is summarized by the LLM into three levels:
    - **Headline:** A concise, attention-grabbing title.
    - **Summary:** A brief overview of the article’s main points.
    - **Detailed:** An in-depth, multi-paragraph explanation for users seeking more information.
  - This multi-level schema is used to construct rich prompts for the conversational pipeline.
- **Vector Storage:** Summarized articles are embedded and stored in Qdrant, enabling fast, semantic retrieval for user queries.

### 4. LLM Conversational RAG Pipeline (`src/services/ragService.js`)

This is the core of the backend’s intelligence, combining retrieval and generation:

- **Retrieval (RAG):**
  - When a user asks a question, the system queries Qdrant for the most semantically relevant news articles.
  - Retrieved articles are formatted using the three-level schema (headline, summary, detailed).
- **Prompt Construction:**
  - The system builds a prompt for the LLM that includes:
    - The user’s question
    - The user’s chat history (for context)
    - The retrieved news articles, each formatted as:
      ```
      Headline: <headline>
      Summary: <summary>
      Detailed: <detailed>
      ```
  - Example system prompt:
    ```
    You are a helpful news assistant. For each news item, provide:
    - Headline: <headline>
    - Summary: <summary>
    - Detailed: <detailed>
    ```
- **LLM Generation:**
  - The constructed prompt is sent to the LLM (e.g., Gemini, OpenAI, etc.)
  - The LLM generates a context-rich, up-to-date response, which is returned to the user and appended to their chat history.

### 5. Redis Chat History & Session Management (`src/utils/redis.js`)

- **User Identification:** Each user is authenticated via Clerk, which provides a unique user ID.
- **Chat History Caching:** The Clerk user ID is used as the Redis key. The value is a list (array) of the user's chat messages (role: user/assistant, content: string).
- **Session Persistence:** When a user sends a message, their chat history is fetched from Redis, updated, and saved back. This ensures users never lose their chat context, even across sessions or devices.
- **Time-to-Live (TTL) for Chat History:**
  - To prevent indefinite storage and manage memory, each user's chat history in Redis is set to expire after 24 hours of inactivity.
  - This is achieved using the `expire` method:
    ```js
    await redisClient.expire(historyKey, 86400); // 86400 seconds = 24 hours
    ```
  - Every time a user sends a message, the TTL is refreshed, ensuring active users retain their chat history while inactive sessions are automatically cleaned up.

#### Example Redis Structure

```
Key: user:{clerk_user_id}
Value: [
  { role: "user", content: "What's the latest on climate change?" },
  { role: "assistant", content: "Here are today's top climate change headlines..." },
  ...
]
```

---

## Frontend Architecture & Details

The frontend is a modern React application bootstrapped with Vite for fast development and optimized builds. It is designed for a seamless, interactive user experience and leverages several key technologies:

### Key Technologies

- **React**: Component-based UI for maintainability and scalability.
- **Vite**: Lightning-fast dev server and build tool.
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent, and responsive styling.
- **Lucide React**: Icon library providing beautiful, customizable SVG icons for UI elements (e.g., user, bot, navigation).
- **Clerk**: Authentication and user management, enabling secure sign-in and unique user identification.
- **Axios**: For HTTP requests to the backend API.

### Environment Variables

The frontend requires the following environment variables in a `.env` file:

| Variable                     | Description                              |
| ---------------------------- | ---------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for authentication |
| `VITE_BACKEND_URL`           | URL of the backend server                |

Example `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_BACKEND_URL=http://localhost:3000
```

### Main Components

- **App.jsx**: Root component, sets up routing and global providers.
- **Pages/ChatPage.jsx**: Main chat interface, handles chat state, message sending, and history retrieval.
- **Pages/Login.jsx**: Handles user authentication, sign-in, and redirects using Clerk.
- **components/Chat.jsx**: Renders the chat conversation, including user and assistant messages, and typing indicators.
- **components/Message.jsx**: Displays individual chat messages, with role-based styling and Lucide icons (e.g., Bot, User).
- **components/UserInput.jsx**: Input box for sending new messages, with send button and keyboard handling.
- **components/Navbar.jsx**: Top navigation bar, includes app branding and user menu (with Clerk's UserButton).

### UI/UX Features

- **Tailwind CSS**: All components are styled using Tailwind utility classes for a clean, modern, and responsive design.
- **Lucide Icons**: Used for avatars (User, Bot), navigation, and status indicators, ensuring a visually appealing interface.
- **Typing Indicator**: Animated dots show when the AI is "thinking" or generating a response.
- **Persistent Chat History**: On login, the app fetches the user's chat history from the backend and displays it, ensuring continuity across sessions.
- **Error Handling**: User-friendly error messages are shown if the backend is unreachable or returns an error.
- **Mobile Responsive**: Layout adapts to different screen sizes for optimal usability on desktop and mobile.

### Authentication & Session

- **Clerk Integration**: All protected routes/components check Clerk's authentication state. The unique Clerk user ID is used throughout the app and sent to the backend for chat history and session management.
- **Sign In/Sign Out**: Uses Clerk's `<SignInButton />` and `<UserButton />` for seamless authentication and user menu.

### How It Works

1. **User signs in** via Clerk. The unique user ID is stored in the frontend state.
2. **ChatPage** loads and fetches the user's chat history from the backend using the user ID.
3. **User sends a message**: The message is optimistically added to the UI, then sent to the backend along with the user ID.
4. **Backend responds** with the AI's answer, which is appended to the chat.
5. **Chat history** is cached in Redis on the backend, keyed by the Clerk user ID, and reloaded on future visits.

## Deployment & Environment

- **Environment Variables:**
  - `QDRANT_COLLECTION_NAME`, `QDRANT_API_KEY` for vector storage
  - `REDIS_URL` for Redis connection
  - Clerk keys for authentication
- **CORS:** Configured to allow all origins for easy frontend-backend integration
- **Vercel/Cloud Deployment:** Use environment variables for backend URLs and secrets

---

## Getting Started

1. **Install dependencies:**
   - Backend: `cd Backend && npm install`
   - Frontend: `cd Frontend && npm install`
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both Backend and Frontend, fill in required values
3. **Run backend:**
   - `npm start` or `node src/server.js` in the Backend folder
4. **Run frontend:**
   - `npm run dev` in the Frontend folder
5. **Access the app:**
   - Open the frontend URL (usually `http://localhost:5173`)

---

## License

MIT License. See [LICENSE](LICENSE) for details.
