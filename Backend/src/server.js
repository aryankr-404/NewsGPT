import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoutes from './routes/chatRoute.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    message: 'Welcome to the Voosh News RAG API!' 
  });
});


app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on http://localhost:${PORT}`);
});

