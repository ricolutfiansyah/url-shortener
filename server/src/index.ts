import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import linkRoutes from './modules/links/links.route';
import analyticsRoutes from './modules/analytics/analytics.route';
import userRoutes from './modules/users/users.route';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: Bun.env.VITE_API_URL || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 60 * 60 * 24,
  }),
);

app.onError((err, c) => {
  console.error(`${err}`);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  return c.json(
    {
      success: false,
      message: 'Internal Server Error',
    },
    500,
  );
});

app.get('/', (c) => {
  return c.text('Welcome to URL Shortener!');
});

const apiRoutes = app
  .route('/api/links', linkRoutes)
  .route('/api/analytics', analyticsRoutes)
  .route('/api/users', userRoutes);

export type AppType = typeof apiRoutes;

export default {
  port: 3000,
  fetch: app.fetch,
};
