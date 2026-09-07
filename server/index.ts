import 'dotenv/config';
import express from 'express';
import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: process.env.OPENAI_MODEL || 'gpt-5-mini' });
});

app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export default app;
