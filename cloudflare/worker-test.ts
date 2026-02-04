import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Worker is running' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Health check passed' });
});

export default app;
