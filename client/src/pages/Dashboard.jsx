import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import WalletForm from '../components/WalletForm'
import WalletCard from '../components/WalletCard'
import useExchangeRates from '../hooks/useExchangeRates'
import SpecularButton from '../components/SpecularButton'

const colors = ['#d97757', '#3c7a89', '#bc8b2d', '#758467', '#8b6f8b', '#b56576', '#567d8d', '#989898']
const themes = [['sunny', 'Sunny'], ['midnight', 'Midnight'], ['gradient', 'Gradient'], ['sakura', 'Sakura'], ['aurora', 'Aurora']]

function money(value, currency, hidden) {
  return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

export default function Dashboard({ user, theme, onThemeChange, hideAmounts }) {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [wallets, setWallets] = useState([])
  const [walletEditor, setWalletEditor] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api('/expenses').then(setExpenses).catch(err => setError(err.message)) }, [])
  useEffect(() => { api('/wallets').then(setWallets).catch(err => setError(err.message)) }, [])
  const currencyItems = useMemo(() => [...expenses, ...wallets], [expenses, wallets])
  const { convert } = useExchangeRates(currencyItems, user.currency)

  const totalSpent = expenses.reduce((sum, item) => sum + convert(item.amount, item.currency || 'PHP'), 0)
  const totalBalance = wallets.reduce((sum, item) => sum + convert(item.balance, item.currency || 'PHP'), 0)
  const grouped = expenses.reduce((all, item) => ({ ...all, [item.category]: (all[item.category] || 0) + convert(item.amount, item.currency || 'PHP') }), {})
  const categories = Object.entries(grouped).sort((a, b) => b[1] - a[1])
  const accountSpending = Object.entries(expenses.reduce((all, item) => { const key = item.account || 'Cash'; all[key] = (all[key] || 0) + convert(item.amount, item.currency || 'PHP'); return all }, {})).sort((a, b) => b[1] - a[1])
  const maxCategory = categories[0]?.[1] || 1

  async function saveWallet(form) {
    try {
      const data = walletEditor.new
        ? await api('/wallets', { method: 'POST', body: JSON.stringify(form) })
        : await api(`/wallets/${walletEditor._id}`, { method: 'PUT', body: JSON.stringify(form) })
      setWallets(current => walletEditor.new ? [data, ...current] : current.map(item => item._id === data._id ? data : item))
      setWalletEditor(null)
    } catch (err) { setError(err.message) }
  }

  async function removeWallet(id) {
    if (!window.confirm('Remove this wallet display?')) return
    try {
      await api(`/wallets/${id}`, { method: 'DELETE' })
      setWallets(current => current.filter(item => item._id !== id))
    } catch (err) { setError(err.message) }
  }

  return <>
    <header className="page-header">
      <div><span className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span><h1>Hey, {user.name.split(' ')[0]}.</h1><p className="muted">Here is how much you have across your wallets.</p></div>
      <div className="header-actions"><ThemePicker theme={theme} onChange={onThemeChange} /><DashboardButton theme={theme} onClick={() => navigate('/expenses?add=true')}>+ Add expense</DashboardButton></div>
    </header>
    {error && <div className="alert error">{error}</div>}
    <section className="wallet-section">
      <div className="section-heading"><div><span className="eyebrow">Your money</span><h2>Total wallet balance</h2></div><DashboardButton theme={theme} secondary onClick={() => setWalletEditor({ new: true })}>+ Add wallet</DashboardButton></div>
      {wallets.length === 0 ? <div className="wallet-empty"><strong>Add your first wallet</strong><span>Track a manual balance like BPI, Cash, or Savings.</span><DashboardButton theme={theme} onClick={() => setWalletEditor({ new: true })}>Add a wallet</DashboardButton></div> : <><div className="wallet-total"><span className="wallet-total-value">{money(totalBalance, user.currency, hideAmounts)}</span><small>across {wallets.length} wallet{wallets.length === 1 ? '' : 's'}</small></div><div className="wallet-grid">{wallets.map(wallet => <WalletCard key={wallet._id} wallet={wallet} user={user} balance={convert(wallet.balance, wallet.currency || 'PHP')} hideAmount={hideAmounts} onEdit={() => setWalletEditor(wallet)} onRemove={() => removeWallet(wallet._id)} />)}</div></>}
    </section>
    <section className="source-summary"><div className="section-heading"><div><span className="eyebrow">Where it went</span><h2>Spending by account</h2></div><Link to="/analytics">View analytics</Link></div><div className="source-summary-grid">{accountSpending.length === 0 ? <span className="muted">Add an expense to see account spending.</span> : accountSpending.slice(0, 4).map(([account, amount]) => <div className="source-summary-item" key={account}><span className="source-summary-dot" /> <div><strong>{account}</strong><small>{money(amount, user.currency, hideAmounts)} spent</small></div></div>)}</div></section>
    <section className="stats-grid"><div className="stat-card accent"><span className="stat-label">Total expenses</span><strong>{money(totalSpent, user.currency, hideAmounts)}</strong><span className="stat-note">Across {expenses.length} transactions</span></div><div className="stat-card"><span className="stat-label">Transactions</span><strong>{expenses.length}</strong><span className="stat-note">All recorded expenses</span></div><div className="stat-card"><span className="stat-label">Average expense</span><strong>{money(expenses.length ? totalSpent / expenses.length : 0, user.currency, hideAmounts)}</strong><span className="stat-note">Per transaction</span></div></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-heading"><div><h2>Recent expenses</h2><p className="muted">Your latest activity</p></div><Link to="/expenses">View all</Link></div>{expenses.length === 0 ? <div className="empty-state"><span className="empty-illustration" aria-hidden="true"><span>+</span></span><strong>Your spending story starts here.</strong><span>Add your first expense and Ledgerly will keep the picture clear.</span><DashboardButton theme={theme} secondary onClick={() => navigate('/expenses?add=true')}>Add first expense</DashboardButton></div> : <div className="expense-list">{expenses.slice(0, 5).map(item => <div className="expense-row" key={item._id}><span className="category-icon"><CategoryIcon category={item.category} /></span><span className="expense-info"><strong>{item.description}</strong><small>{item.category} · {item.walletId?.label || 'No account selected'} · {new Date(item.date).toLocaleDateString()}</small></span><strong>{hideAmounts ? '****' : money(item.amount, user.currency)}</strong></div>)}</div>}</div><div className="panel"><div className="panel-heading"><div><h2>By category</h2><p className="muted">Where your money goes</p></div></div>{categories.length === 0 ? <div className="empty-state compact"><span className="empty-illustration small" aria-hidden="true"><span>+</span></span><strong>Your categories will grow here.</strong><span>Add expenses to see your patterns.</span></div> : <div className="category-list">{categories.map(([category, amount], index) => <div className="category-item" key={category}><div className="category-top"><span><i style={{ background: colors[index % colors.length] }} />{category}</span><strong>{money(amount, user.currency, hideAmounts)}</strong></div><div className="bar"><span style={{ width: `${amount / maxCategory * 100}%`, background: colors[index % colors.length] }} /></div></div>)}</div>}</div></section>
    {walletEditor && <div className="modal-backdrop"><div className="modal"><WalletForm wallet={walletEditor.new ? null : walletEditor} userCurrency={user.currency} onSubmit={saveWallet} onCancel={() => setWalletEditor(null)} /></div></div>}
  </>
}

function DashboardButton({ children, theme, secondary = false, onClick }) {
  const palette = theme === 'sakura'
    ? { tint: secondary ? '#fff7f8' : '#e8a0b2', textColor: secondary ? '#632f40' : '#ffffff', lineColor: '#fff7f8', baseColor: '#b96b82' }
    : theme === 'gradient'
    ? { tint: secondary ? '#ffffff' : '#fff4a8', textColor: secondary ? '#ffffff' : '#10233d', lineColor: '#ffffff', baseColor: '#64748b' }
    : theme === 'midnight'
      ? { tint: secondary ? '#ffffff' : '#66b6ca', textColor: secondary ? '#f5f7fa' : '#102333', lineColor: '#d7fbff', baseColor: '#426b78' }
      : { tint: secondary ? '#ffffff' : '#176b87', textColor: secondary ? '#17212f' : '#ffffff', lineColor: '#d2f7ff', baseColor: '#0f5269' }
  return <SpecularButton type="button" size="sm" radius={8} tint={palette.tint} tintOpacity={secondary ? 0.12 : 0.72} blur={8} textColor={palette.textColor} lineColor={palette.lineColor} baseColor={palette.baseColor} intensity={1.05} shineSize={12} shineFade={35} thickness={1.1} speed={0.35} followMouse proximity={220} onClick={onClick}>{children}</SpecularButton>
}

function CategoryIcon({ category }) {
  const paths = { Food: 'M5 4v16M5 4c2 2 2 5 0 7M9 4v16M19 4v16M15 4c-2 4-2 7 4 7', Transportation: 'M5 16h14l-1-6H6l-1 6Zm3 0v2m8-2v2M7 10l1-3h8l1 3', Shopping: 'M5 8h14l-1 11H6L5 8Zm4 0a3 3 0 0 1 6 0', Bills: 'M7 3h10v18H7zM10 7h4M10 11h4M10 15h4', Entertainment: 'm5 8 2 10h10l2-10-4 3-3-4-3 4-4-3Zm7 9v2', Health: 'M12 20S4 15 4 9a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11Z', Education: 'm4 7 8-4 8 4-8 4-8-4Zm3 3v5c3 2 7 2 10 0v-5', Other: 'M12 3v18M3 12h18' }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[category] || paths.Other} /></svg>
}

function ThemePicker({ theme, onChange }) {
  return <label className="theme-picker"><span>Choose your look</span><select value={theme} onChange={event => onChange(event.target.value)} aria-label="Choose your look">{themes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
}
