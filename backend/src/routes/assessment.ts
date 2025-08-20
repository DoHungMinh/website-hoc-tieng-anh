import { Router } from 'express';

const router = Router();

// Assessment routes will be implemented here
router.get('/test', (req, res) => {
  res.json({ message: 'Assessment routes working' });
});

export default router;
