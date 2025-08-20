import { Router } from 'express';

const router = Router();

// User routes will be implemented here
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

export default router;
