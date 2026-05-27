import { Router } from 'express';

// STUB router. F5 replaces this with the real /api/analyze handler
// (loadCorpus -> build prompt -> callModel -> AnalysisResult).
const router = Router();

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented: /api/analyze (Feature F5)' });
});

export default router;
