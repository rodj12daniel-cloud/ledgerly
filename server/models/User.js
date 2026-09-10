import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  cardColor: { type: String, default: '#1769AA' },
  currency: { type: String, enum: ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD'], default: 'USD' },
  preferredTheme: { type: String, enum: ['sunny', 'gradient', 'sakura', 'ocean', 'midnight'], default: 'sunny' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema)
