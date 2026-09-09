import { Router } from 'express'
import Wallet from '../models/Wallet.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const moneyTypes = ['cash', 'bank', 'ewallet', 'digital-wallet']
const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']
function styleForLabel(label) {
  const name = label.toLowerCase()
  if (name.includes('bpi')) return 'coral'
  if (name.includes('gcash') || name.includes('maya') || name.includes('pay')) return 'tide'
  if (name.includes('cash') || name.includes('savings')) return 'citrus'
  return 'ink'
}

function validate(body) {
  if (!body.account?.trim() && !body.label?.trim()) return 'Choose an account.'
  if (!moneyTypes.includes(body.moneyType)) return 'Choose a valid money type.'
  if (body.currency && !currencies.includes(body.currency)) return 'Choose a valid currency.'
  if ((body.account || body.label).trim().length > 60) return 'Account name must be 60 characters or fewer.'
  if (!Number.isFinite(Number(body.balance)) || Number(body.balance) < 0) return 'Balance cannot be negative.'
  return null
}

router.use(requireAuth)
router.get('/', async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(wallets.map(wallet => ({ ...wallet.toObject(), label: wallet.account || wallet.label, style: styleForLabel(wallet.account || wallet.label) })))
  }
  catch { res.status(500).json({ message: 'Unable to load wallets.' }) }
})
router.post('/', async (req, res) => {
  const error = validate(req.body)
  if (error) return res.status(400).json({ message: error })
  try { res.status(201).json(await Wallet.create({ userId: req.userId, label: (req.body.account || req.body.label).trim(), account: (req.body.account || req.body.label).trim(), moneyType: req.body.moneyType, currency: req.body.currency || 'PHP', balance: Number(req.body.balance), accountColor: req.body.accountColor || '#667085', accountLogo: req.body.accountLogo || '', style: styleForLabel(req.body.account || req.body.label) })) }
  catch { res.status(500).json({ message: 'Unable to save the wallet.' }) }
})
router.put('/:id', async (req, res) => {
  const error = validate(req.body)
  if (error) return res.status(400).json({ message: error })
  try {
    const account = (req.body.account || req.body.label).trim()
    const wallet = await Wallet.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { label: account, account, moneyType: req.body.moneyType, currency: req.body.currency || 'PHP', balance: Number(req.body.balance), accountColor: req.body.accountColor || '#667085', accountLogo: req.body.accountLogo || '', style: styleForLabel(account) }, { new: true, runValidators: true })
    if (!wallet) return res.status(404).json({ message: 'Wallet not found.' })
    res.json(wallet)
  } catch { res.status(500).json({ message: 'Unable to update the wallet.' }) }
})
router.delete('/:id', async (req, res) => {
  try {
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!wallet) return res.status(404).json({ message: 'Wallet not found.' })
    res.json({ message: 'Wallet deleted.' })
  } catch { res.status(500).json({ message: 'Unable to delete the wallet.' }) }
})

export default router
