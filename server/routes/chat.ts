import { Router } from 'express';

// STUB router. F6 replaces this with the real /api/chat handler
// (loadCorpus -> build prompt -> callModel -> ChatResponse).
const router = Router();

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented: /api/chat (Feature F6)' });
});

export default router;
