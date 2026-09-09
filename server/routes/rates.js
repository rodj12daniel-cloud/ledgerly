import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/', requireAuth, async (req, res) => {
  const { from, to } = req.query
  if (!from || !to || from === to) return res.json({ rate: 1, source: 'same-currency' })
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`)
    if (!response.ok) return res.status(502).json({ message: 'Exchange rates are temporarily unavailable.' })
    const data = await response.json()
    res.json({ rate: data.rates?.[to] || null, source: 'open.er-api.com' })
  } catch { res.status(502).json({ message: 'Exchange rates are temporarily unavailable.' }) }
})
export default router
