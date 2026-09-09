import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import expenseRoutes from './routes/expenses.js'
import walletRoutes from './routes/wallets.js'
import rateRoutes from './routes/rates.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin: (origin, callback) => {
    const isLocalFrontend = !origin || /^http:\/\/localhost:\d+$/.test(origin)
    const configuredFrontend = origin === (process.env.CLIENT_URL || 'http://localhost:5173')
    callback(null, isLocalFrontend || configuredFrontend)
  }
}))
app.use(express.json({ limit: '4mb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api', userRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/wallets', walletRoutes)
app.use('/api/rates', rateRoutes)
app.use((error, _req, res, _next) => {
  console.error(error)
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large. Choose an image under 2 MB.' })
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
