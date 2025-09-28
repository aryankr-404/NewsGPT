// ChatRoute.js
import { Router } from "express";
import { getAiResponse } from "../services/ragService.js";
import { redisClient } from "../utils/redis.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question, userId } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }
    if (!userId) {
      return res.status(400).json({ error: "UserId is required." });
    }

    const historyKey = `history:${userId}`;

    const history = await redisClient.lrange(historyKey, -1, -1);

    const aiResponse = await getAiResponse(question, history);

    await redisClient.rpush(
      historyKey,
      JSON.stringify({ role: "user", content: question })
    );
    await redisClient.rpush(
      historyKey,
      JSON.stringify({ role: "assistant", content: aiResponse })
    );
    await redisClient.expire(historyKey, 86400);

    res.json({
      answer: aiResponse,
      userId: userId,
    });
  } catch (error) {
    console.error("Error in POST /chat route:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const historyKey = `history:${userId}`;

    const history = await redisClient.lrange(historyKey, 0, -1);
    const parsedHistory = history.map((item) => JSON.parse(item));

    res.json({ history: parsedHistory });
  } catch (error) {
    console.error("Error in GET /history/:userId route:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

export default router;
