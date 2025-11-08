import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

// Get current user profile
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Placeholder for additional auth routes
authRouter.post('/register', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Registration handled by Firebase client SDK' });
});
