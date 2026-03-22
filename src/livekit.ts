import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY    || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL        = process.env.LIVEKIT_URL        || 'ws://localhost:7880';

// GET /api/livekit/token?uid=<firebase-uid>
router.get('/token', (req: Request, res: Response) => {
  const uid = req.query.uid as string;

  if (!uid) {
    res.status(400).json({ message: 'Missing uid parameter.' });
    return;
  }

  const roomName = `voice-room-${uid}`;

  const payload = {
    iss: LIVEKIT_API_KEY,
    sub: uid,
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    },
  };

  const token = jwt.sign(payload, LIVEKIT_API_SECRET, { algorithm: 'HS256' });
  res.json({ token, roomName, url: LIVEKIT_URL });
});

export default router;
