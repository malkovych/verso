import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';

import chatRoutes from './routes/chat.js';
import knowledgeBaseRoutes from './routes/knowledgeBase.js';
import dashboardRoutes from './routes/dashboard.js';
import integrationsRoutes from './routes/integrations.js';
import subscriptionRoutes from './routes/subscriptions.js';
import { checkOllamaHealth } from './services/llm.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.NODE_ENV === 'production' ? false : '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/chat', chatRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', async (_req, res) => {
  const ollama = await checkOllamaHealth();
  res.json({
    status: ollama.ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    ollama,
  });
});

app.listen(env.PORT, async () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);

  const ollama = await checkOllamaHealth();
  if (ollama.ok) {
    console.log(`Ollama: connected, model "${ollama.model}" ready`);
  } else {
    console.warn(`Ollama WARNING: ${ollama.error}`);
  }
});

export default app;
