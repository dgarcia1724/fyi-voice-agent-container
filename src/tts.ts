import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI();

router.post('/', async (req, res) => {
  const { text } = req.body as { text: string };
  if (!text?.trim()) { res.status(400).json({ error: 'text required' }); return; }

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err: any) {
    console.error('TTS error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'TTS failed' });
  }
});

export default router;
