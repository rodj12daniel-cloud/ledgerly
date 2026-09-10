import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import WalletForm from '../components/WalletForm'
import WalletCard from '../components/WalletCard'
import useExchangeRates from '../hooks/useExchangeRates'

function money(value, currency, hidden) { return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) }

export default function Accounts({ user, hideAmounts }) {
  const [wallets, setWallets] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api('/wallets').then(setWallets).catch(err => setError(err.message)) }, [])
  async function save(form) { try { const data = editing.new ? await api('/wallets', { method: 'POST', body: JSON.stringify(form) }) : await api(`/wallets/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) }); setWallets(current => editing.new ? [data, ...current] : current.map(item => item._id === data._id ? data : item)); setEditing(null) } catch (err) { setError(err.message) } }
  async function remove(id) { if (!window.confirm('Remove this wallet display?')) return; try { await api(`/wallets/${id}`, { method: 'DELETE' }); setWallets(current => current.filter(item => item._id !== id)) } catch (err) { setError(err.message) } }
  async function changeColor(wallet, accountColor) { try { const data = await api(`/wallets/${wallet._id}`, { method: 'PUT', body: JSON.stringify({ ...wallet, accountColor }) }); setWallets(current => current.map(item => item._id === data._id ? data : item)) } catch (err) { setError(err.message) } }
  const currencyItems = useMemo(() => wallets, [wallets])
  const { convert } = useExchangeRates(currencyItems, user.currency)
  const total = wallets.reduce((sum, item) => sum + convert(item.balance, item.currency || 'PHP'), 0)
  return <><header className="page-header"><div><span className="eyebrow">Accounts and sources</span><h1>Your accounts</h1><p className="muted">Manual balances for the places you keep money.</p></div><button className="button primary" onClick={() => setEditing({ new: true })}>+ Add account</button></header>{error && <div className="alert error">{error}</div>}<section className="accounts-summary"><span>Total across accounts</span><strong>{money(total, user.currency, hideAmounts)}</strong></section>{wallets.length === 0 ? <section className="wallet-empty page-empty"><strong>No accounts yet</strong><span>Add a manual source such as BPI, GCash, Cash, or Savings.</span><button className="button secondary" onClick={() => setEditing({ new: true })}>Add an account</button></section> : <section className="wallet-grid accounts-grid">{wallets.map(wallet => <WalletCard key={wallet._id} wallet={wallet} user={user} balance={convert(wallet.balance, wallet.currency || 'PHP')} hideAmount={hideAmounts} onEdit={() => setEditing(wallet)} onRemove={() => remove(wallet._id)} onColorChange={color => changeColor(wallet, color)} />)}</section>}{editing && <div className="modal-backdrop"><div className="modal"><WalletForm wallet={editing.new ? null : editing} userCurrency={user.currency} onSubmit={save} onCancel={() => setEditing(null)} /></div></div>}</>
}
