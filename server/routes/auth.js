import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture, currency: user.currency, preferredTheme: user.preferredTheme })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, currency = 'USD' } = req.body
    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) return res.status(400).json({ message: 'Please complete all required fields.' })
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' })
    if (!currencies.includes(currency)) return res.status(400).json({ message: 'Choose a supported currency.' })
    if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with that email already exists.' })

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 12), currency })
    res.status(201).json({ token: createToken(user._id), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Unable to create your account right now.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() })
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' })
    res.json({ token: createToken(user._id), user: publicUser(user) })
  } catch {
    res.status(500).json({ message: 'Unable to log in right now.' })
  }
})

export default router
