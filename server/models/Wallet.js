import mongoose from 'mongoose'

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, required: true, trim: true, maxlength: 40 },
  moneyType: { type: String, enum: ['cash', 'bank', 'ewallet', 'digital-wallet'], default: 'cash' },
  account: { type: String, required: true, trim: true, maxlength: 60, default: 'Cash' },
  accountColor: { type: String, default: '#2E7D32' },
  accountLogo: { type: String, default: '' },
  currency: { type: String, enum: ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD'], default: 'PHP' },
  balance: { type: Number, required: true, min: 0 },
  style: { type: String, enum: ['coral', 'tide', 'citrus', 'ink'], default: 'coral' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Wallet', walletSchema)
