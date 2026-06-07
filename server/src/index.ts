import { Hono } from 'hono'
import { logger } from 'hono/logger'
import linkRoutes from './modules/links/links.routes'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  return c.text('Welcome to URL Shortener!')
})

const apiRoutes = app.route('/api/links', linkRoutes)

export type AppType = typeof apiRoutes

export default {
  port: 3000,
  fetch: app.fetch
}
