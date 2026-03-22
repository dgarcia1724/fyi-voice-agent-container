import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI();

router.post('/', async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  if (!messages?.length) {
    res.status(400).json({ error: 'messages required' });
    return;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: "You are FYI's AI assistant — warm, concise, and helpful." },
        ...messages,
      ] as OpenAI.ChatCompletionMessageParam[],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) res.write(content);
    }
    res.end();
  } catch (err: any) {
    console.error('OpenAI error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;
