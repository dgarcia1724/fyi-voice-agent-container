import { Router, Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY    || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'devsecret-fyi-mern-app-key-long-enough';
const LIVEKIT_URL        = process.env.LIVEKIT_URL        || 'ws://localhost:7880';

// GET /api/livekit/token?uid=<firebase-uid>
router.get('/token', async (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  if (!uid) { res.status(400).json({ message: 'Missing uid parameter.' }); return; }

  const roomName = `voice-room-${uid}-${Date.now()}`;

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: uid,
    ttl: '1h',
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();
  res.json({ token, roomName, url: LIVEKIT_URL });
});

export default router;
