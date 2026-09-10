import { Router } from 'express'
import User from '../models/User.js'
import Expense from '../models/Expense.js'
import Wallet from '../models/Wallet.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']
const themes = ['sunny', 'gradient', 'sakura', 'ocean', 'midnight']
const imagePattern = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found.' })
  res.json({ id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture, currency: user.currency, preferredTheme: user.preferredTheme, cardColor: user.cardColor })
})

router.put('/me', requireAuth, async (req, res) => {
  try {
    const updates = {}
    if (typeof req.body.name === 'string' && req.body.name.trim()) updates.name = req.body.name.trim()
    if (currencies.includes(req.body.currency)) updates.currency = req.body.currency
    if (typeof req.body.cardColor === 'string' && /^#[0-9a-f]{6}$/i.test(req.body.cardColor)) updates.cardColor = req.body.cardColor
    if (themes.includes(req.body.preferredTheme)) updates.preferredTheme = req.body.preferredTheme
    if (req.body.profilePicture === '') updates.profilePicture = ''
    if (typeof req.body.profilePicture === 'string' && imagePattern.test(req.body.profilePicture) && req.body.profilePicture.length <= 2800000) updates.profilePicture = req.body.profilePicture
    if (req.body.profilePicture && !updates.profilePicture) return res.status(400).json({ message: 'Profile picture must be a PNG, JPG, or WebP image under 2 MB.' })
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password')
    res.json({ id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture, currency: user.currency, preferredTheme: user.preferredTheme, cardColor: user.cardColor })
  } catch {
    res.status(500).json({ message: 'Unable to update your profile.' })
  }
})

router.delete('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    await Expense.deleteMany({ userId: req.userId })
    await Wallet.deleteMany({ userId: req.userId })
    await User.findByIdAndDelete(req.userId)
    res.json({ message: 'Your account and expenses have been permanently deleted.' })
  } catch {
    res.status(500).json({ message: 'Unable to delete your account right now.' })
  }
})

export default router
