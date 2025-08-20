import { Router } from 'express';

const router = Router();

// Progress routes will be implemented here
router.get('/test', (req, res) => {
  res.json({ message: 'Progress routes working' });
});

export default router;
