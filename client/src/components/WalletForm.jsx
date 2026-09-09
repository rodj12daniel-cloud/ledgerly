import { useEffect, useState } from 'react'
import MoneySourcePicker from './MoneySourcePicker'

const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']
const blank = { label: '', balance: '', moneyType: 'cash', account: 'Cash', accountColor: '#2E7D32', accountLogo: '', currency: 'PHP' }

export default function WalletForm({ wallet, onSubmit, onCancel, userCurrency = 'PHP' }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  useEffect(() => setForm(wallet ? { ...blank, ...wallet, account: wallet.account || wallet.label || 'Cash', label: wallet.label || wallet.account || 'Cash', moneyType: wallet.moneyType || 'cash', currency: wallet.currency || 'PHP' } : { ...blank, currency: userCurrency }), [wallet, userCurrency])
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  function sourceChange(next) { setForm({ ...form, ...next, label: next.account || form.label }) }
  function submit(event) {
    event.preventDefault()
    setError('')
    if (!form.account?.trim() || form.balance === '' || Number(form.balance) < 0) return setError('Choose an account and enter a balance of 0 or more.')
    onSubmit({ ...form, label: form.account.trim(), account: form.account.trim(), balance: Number(form.balance) })
  }
  return <form className="wallet-form" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">{wallet ? 'Update account' : 'New account'}</span><h2>{wallet ? 'Edit balance' : 'Add an account'}</h2></div><button type="button" className="icon-button" onClick={onCancel}>×</button></div><div className="privacy-notice"><strong>Manual balance only</strong><span>Select an account/source and amount for display. Do not enter card numbers, PINs, or banking credentials.</span></div>{error && <div className="alert error">{error}</div>}<MoneySourcePicker value={form} onChange={sourceChange} /><label className="wallet-balance-field">Current balance<input name="balance" type="number" min="0" step="0.01" value={form.balance} onChange={change} placeholder="0.00" /></label><label>Balance currency<select name="currency" value={form.currency} onChange={change}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select><small className="field-help">This is the currency your balance is stored in.</small></label><p className="field-help wallet-auto-style">Your account choice and brand accent will be saved to your profile.</p><div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary">{wallet ? 'Save account' : 'Add account'}</button></div></form>
}
