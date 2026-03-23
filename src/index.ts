import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import authRouter from './auth';
import livekitRouter from './livekit';
import chatRouter from './chat';
import ttsRouter from './tts';

const app = express();
const PORT = 3000;

const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:3000').split(',');
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/auth', authRouter);
app.use('/api/livekit', livekitRouter);
app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
