import { Router } from 'express';

const router = Router();

// Learning routes will be implemented here
router.get('/test', (req, res) => {
  res.json({ message: 'Learning routes working' });
});

export default router;
