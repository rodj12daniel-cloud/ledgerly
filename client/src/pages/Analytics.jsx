import { useEffect, useState } from 'react'
import { api } from '../api'
import useExchangeRates from '../hooks/useExchangeRates'

function money(value, currency, hidden) { return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) }
export default function Analytics({ user, hideAmounts }) {
  const [expenses, setExpenses] = useState([]); const [error, setError] = useState('')
  useEffect(() => { api('/expenses').then(setExpenses).catch(err => setError(err.message)) }, [])
  const { convert } = useExchangeRates(expenses, user.currency)
  const grouped = expenses.reduce((all, item) => ({ ...all, [item.category]: (all[item.category] || 0) + convert(item.amount, item.currency || 'PHP') }), {})
  const categories = Object.entries(grouped).sort((a, b) => b[1] - a[1]); const total = expenses.reduce((sum, item) => sum + convert(item.amount, item.currency || 'PHP'), 0); const max = categories[0]?.[1] || 1
  return <><header className="page-header"><div><span className="eyebrow">Your patterns</span><h1>Analytics</h1><p className="muted">A clear view of your manually entered spending.</p></div></header>{error && <div className="alert error">{error}</div>}<section className="analytics-summary"><div><span>Total spent</span><strong>{money(total, user.currency, hideAmounts)}</strong></div><div><span>Transactions</span><strong>{expenses.length}</strong></div><div><span>Top category</span><strong>{categories[0]?.[0] || 'Not yet'}</strong></div></section><section className="panel analytics-panel"><div className="panel-heading"><div><h2>Spending by category</h2><p className="muted">Based on your real expense records.</p></div></div>{categories.length === 0 ? <div className="empty-state"><strong>Your first pattern is waiting.</strong><span>Add expenses to see a category breakdown.</span></div> : <div className="category-list analytics-list">{categories.map(([category, amount], index) => <div className="category-item" key={category}><div className="category-top"><span><i style={{ background: ['#287b86', '#ef9a67', '#bc8b2d', '#758467'][index % 4] }} />{category}</span><strong>{money(amount, user.currency, hideAmounts)}</strong></div><div className="bar"><span style={{ width: `${amount / max * 100}%`, background: ['#287b86', '#ef9a67', '#bc8b2d', '#758467'][index % 4] }} /></div></div>)}</div>}</section></>
}
