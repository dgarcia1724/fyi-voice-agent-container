import { Router, Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import jwt from 'jsonwebtoken';

const router = Router();

const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY    || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL        = process.env.LIVEKIT_URL        || 'ws://localhost:7880';
const APP_JWT_SECRET     = process.env.JWT_SECRET         || 'dev-secret-change-in-prod';

// GET /api/livekit/token
router.get('/token', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or malformed Authorization header.' });
    return;
  }

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(authHeader.slice(7), APP_JWT_SECRET) as jwt.JwtPayload;
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }

  const userId   = String(payload.sub);
  const roomName = `voice-room-${userId}`;

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    ttl:      '1h',
  });

  token.addGrant({
    roomJoin:     true,
    room:         roomName,
    canPublish:   true,
    canSubscribe: true,
  });

  const livekitToken = await token.toJwt();
  res.json({ token: livekitToken, roomName, url: LIVEKIT_URL });
});

export default router;
