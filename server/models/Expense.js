import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null },
  moneyType: { type: String, enum: ['cash', 'bank', 'ewallet', 'digital-wallet'], default: 'cash' },
  account: { type: String, required: true, trim: true, maxlength: 60, default: 'Cash' },
  accountColor: { type: String, default: '#2E7D32' },
  accountLogo: { type: String, default: '' },
  currency: { type: String, enum: ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD'], default: 'PHP' },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, enum: ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'], required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Expense', expenseSchema)
