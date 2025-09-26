import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAiResponse } from '../services/ragService.js';
import { redisClient } from '../utils/ioredis.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { question, sessionId: oldSessionId } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const sessionId = oldSessionId || uuidv4();
    const historyKey = `history:${sessionId}`;

    const history = await redisClient.lrange(historyKey, 0, -1);

    const aiResponse = await getAiResponse(question, history);

    await redisClient.rpush(historyKey, JSON.stringify({ role: 'user', content: question }));
    await redisClient.rpush(historyKey, JSON.stringify({ role: 'assistant', content: aiResponse }));

    res.json({
      answer: aiResponse,
      sessionId: sessionId,
    });

  } catch (error) {
    console.error('Error in POST /chat route:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const historyKey = `history:${sessionId}`;
    
    const history = await redisClient.lrange(historyKey, 0, -1);

    const parsedHistory = history.map(item => JSON.parse(item));

    res.json({ history: parsedHistory });

  } catch (error) {
    console.error('Error in GET /history/:sessionId route:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;

