import { useEffect, useState } from 'react'
import MoneySourcePicker from './MoneySourcePicker'

const categories = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']
const blank = { description: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), moneyType: 'cash', account: 'Cash', accountColor: '#2E7D32', accountLogo: '', currency: 'PHP' }

export default function ExpenseForm({ expense, wallets = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  useEffect(() => setForm(expense ? { ...blank, ...expense, walletId: expense.walletId?._id || expense.walletId || '', date: expense.date.slice(0, 10), moneyType: expense.moneyType || 'cash', account: expense.account || 'Cash', currency: expense.currency || 'PHP' } : blank), [expense])
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  function sourceChange(next) { setForm({ ...form, ...next, account: next.account || form.account }) }
  function submit(event) { event.preventDefault(); setError(''); if (!form.description.trim() || !form.amount || Number(form.amount) <= 0 || !form.category || !form.date || !form.account) return setError('Complete the expense details and choose an account source.'); onSubmit(form) }
  return <form className="expense-form" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">{expense ? 'Update record' : 'New record'}</span><h2>{expense ? 'Edit expense' : 'Add an expense'}</h2></div><button type="button" className="icon-button" onClick={onCancel}>×</button></div>{error && <div className="alert error">{error}</div>}<label>Expense name<input name="description" value={form.description} onChange={change} placeholder="e.g. Weekly groceries" autoFocus /></label><div className="form-grid"><label>Amount<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} placeholder="0.00" /></label><label>Original currency<select name="currency" value={form.currency} onChange={change}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></label></div><MoneySourcePicker value={form} wallets={wallets} onChange={sourceChange} /><div className="form-grid"><label>Category<select name="category" value={form.category} onChange={change}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Date<input name="date" type="date" value={form.date} onChange={change} /></label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary">{expense ? 'Save changes' : 'Add expense'}</button></div></form>
}
