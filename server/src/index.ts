import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import linkRoutes from './modules/links/links.route'
import analyticsRoutes from './modules/analytics/analytics.route'
import userRoutes from './modules/users/users.route'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  maxAge: 60 * 60 * 24,
  credentials: true
}))

app.get('/', (c) => {
  return c.text('Welcome to URL Shortener!')
})

const apiRoutes = app
  .route('/api/links', linkRoutes)
  .route('/api/analytics', analyticsRoutes)
  .route('/api/users', userRoutes)

export type AppType = typeof apiRoutes

export default {
  port: 3000,
  fetch: app.fetch
}
