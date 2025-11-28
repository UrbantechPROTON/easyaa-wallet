import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Import routes
import paymasterRoutes from './routes/paymaster'
import accountRoutes from './routes/account'
import bundlerRoutes from './routes/bundler'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API routes
app.route('/api/paymaster', paymasterRoutes)
app.route('/api/account', accountRoutes)
app.route('/api/bundler', bundlerRoutes)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'EasyAA Wallet API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EasyAA Wallet - Account Abstraction Made Simple</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#6366f1',
                  secondary: '#8b5cf6',
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
        <div id="app"></div>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
