import { Router } from 'express';

const router = Router();

// Chatbot routes will be implemented here
router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot routes working' });
});

export default router;
