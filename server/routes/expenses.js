import { Router } from 'express'
import Expense from '../models/Expense.js'
import Wallet from '../models/Wallet.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const categories = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
const moneyTypes = ['cash', 'bank', 'ewallet', 'digital-wallet']

function validateExpense(body) {
  if (!body.description?.trim()) return 'Description is required.'
  if (!Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0) return 'Amount must be greater than 0.'
  if (!categories.includes(body.category)) return 'Choose a valid category.'
  if (!body.date || Number.isNaN(new Date(body.date).getTime())) return 'Date is required.'
  if (!moneyTypes.includes(body.moneyType)) return 'Choose a valid money type.'
  if (!body.account?.trim()) return 'Choose an account or source.'
  if (!['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD'].includes(body.currency)) return 'Choose a valid currency.'
  return null
}

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).populate('walletId', 'label style').sort({ date: -1, createdAt: -1 })
    res.json(expenses)
  } catch { res.status(500).json({ message: 'Unable to load expenses.' }) }
})

router.post('/', async (req, res) => {
  const error = validateExpense(req.body)
  if (error) return res.status(400).json({ message: error })
  try {
    const wallet = req.body.walletId ? await Wallet.findOne({ _id: req.body.walletId, userId: req.userId }) : null
    if (req.body.walletId && !wallet) return res.status(404).json({ message: 'Wallet not found.' })
    const expense = await Expense.create({ userId: req.userId, walletId: wallet?._id || null, description: req.body.description.trim(), amount: Number(req.body.amount), category: req.body.category, date: new Date(req.body.date), moneyType: req.body.moneyType, account: req.body.account.trim(), accountColor: req.body.accountColor || '#2E7D32', accountLogo: req.body.accountLogo || '', currency: req.body.currency })
    res.status(201).json(await expense.populate('walletId', 'label style'))
  } catch { res.status(500).json({ message: 'Unable to save the expense.' }) }
})

router.put('/:id', async (req, res) => {
  const error = validateExpense(req.body)
  if (error) return res.status(400).json({ message: error })
  try {
    const wallet = req.body.walletId ? await Wallet.findOne({ _id: req.body.walletId, userId: req.userId }) : null
    if (req.body.walletId && !wallet) return res.status(404).json({ message: 'Wallet not found.' })
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { walletId: wallet?._id || null, description: req.body.description.trim(), amount: Number(req.body.amount), category: req.body.category, date: new Date(req.body.date), moneyType: req.body.moneyType, account: req.body.account.trim(), accountColor: req.body.accountColor || '#2E7D32', accountLogo: req.body.accountLogo || '', currency: req.body.currency }, { new: true, runValidators: true }).populate('walletId', 'label style')
    if (!expense) return res.status(404).json({ message: 'Expense not found.' })
    res.json(expense)
  } catch { res.status(500).json({ message: 'Unable to update the expense.' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!expense) return res.status(404).json({ message: 'Expense not found.' })
    res.json({ message: 'Expense deleted.' })
  } catch { res.status(500).json({ message: 'Unable to delete the expense.' }) }
})

export default router
