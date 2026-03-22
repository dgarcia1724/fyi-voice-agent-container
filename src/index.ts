import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import authRouter from './auth';
import livekitRouter from './livekit';
import chatRouter from './chat';

const app = express();
const PORT = 3000;

app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:3000'] }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/auth', authRouter);
app.use('/api/livekit', livekitRouter);
app.use('/api/chat', chatRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
