import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { api } from '../api'
import useExchangeRates from '../hooks/useExchangeRates'
import SpecularButton from './SpecularButton'

function money(value, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function typeLabel(type) {
  return type === 'bank' ? 'Bank Accounts' : type === 'ewallet' ? 'E-Wallets' : type === 'digital-wallet' ? 'Digital Wallets' : 'Cash'
}

export default function NetWorthCard({ user }) {
  const [wallets, setWallets] = useState([])
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef(null)

  useEffect(() => { api('/wallets').then(setWallets).catch(err => setError(err.message)) }, [])
  const { convert } = useExchangeRates(wallets, user.currency)
  const converted = useMemo(() => wallets.map(wallet => ({ ...wallet, converted: convert(wallet.balance, wallet.currency || 'PHP') })), [wallets, convert])
  const total = converted.reduce((sum, wallet) => sum + wallet.converted, 0)
  const typeTotals = converted.reduce((all, wallet) => { const key = wallet.moneyType || 'cash'; all[key] = (all[key] || 0) + wallet.converted; return all }, {})
  const issued = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

  async function downloadCheck() {
    if (!cardRef.current) return
    cardRef.current.classList.add('is-exporting')
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: '#fffdf8', useCORS: true })
      const link = document.createElement('a')
      link.download = 'ledgerly-net-worth-check.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      cardRef.current.classList.remove('is-exporting')
    }
  }

  return <section className="net-worth-panel">
    <div className="net-worth-heading"><div><span className="eyebrow">Statement</span><h2>Net worth check</h2></div><button className="net-worth-flip" type="button" onClick={() => setFlipped(value => !value)}>{flipped ? 'Show front' : 'View breakdown'}</button></div>
    {error && <div className="alert error">{error}</div>}
    <div ref={cardRef} className={`net-worth-card ${flipped ? 'is-flipped' : ''}`} style={{ '--check-card-color': user.cardColor || '#1769AA' }}>
      <div className="net-worth-face net-worth-front">
        <div className="check-company"><img src="/assets/images/vector.png" alt="Ledgerly" /><span>LEDGERLY</span></div>
        <div className="check-date"><small>DATE</small><span>{issued}</span></div>
        <div className="check-payee"><div className="check-identity">{user.profilePicture ? <img src={user.profilePicture} alt="" /> : <span>{user.name.charAt(0).toUpperCase()}</span>}<strong>{user.name}</strong></div></div>
        <div className="check-amount"><span>{user.currency}</span><strong>{money(total, user.currency)}</strong></div>
        <div className="check-amount-words">Personal net worth statement</div>
        <div className="check-memo"><small>MEMO</small><span>Ledgerly account summary</span></div>
        <div className="check-signature"><span>Authorized signature</span></div>
        <div className="check-routing">Ledgerly <span>•</span> {user.currency} <span>•</span> PERSONAL STATEMENT</div>
      </div>
      <div className="net-worth-face net-worth-back">
        <div className="net-worth-back-title">Account breakdown</div>
        <div className="net-worth-list">{converted.length === 0 ? <span className="muted">No saved accounts yet.</span> : converted.map(wallet => <div key={wallet._id}><span>{wallet.account || wallet.label}</span><strong>{money(wallet.converted, user.currency)}</strong></div>)}</div>
        <div className="net-worth-back-title">Money type totals</div>
        <div className="net-worth-list type-list">{Object.entries(typeTotals).map(([type, amount]) => <div key={type}><span>{typeLabel(type)}</span><strong>{money(amount, user.currency)}</strong></div>)}</div>
        <div className="net-worth-total"><span>Total net worth</span><strong>{money(total, user.currency)}</strong></div>
      </div>
    </div>
    <div className="net-worth-actions"><SpecularButton className="red-action" size="sm" radius={8} tint="#176b87" tintOpacity={0.72} blur={8} textColor="#ffffff" lineColor="#d2f7ff" baseColor="#0f5269" intensity={1.05} shineSize={12} shineFade={35} thickness={1.1} speed={0.35} followMouse proximity={220} onClick={downloadCheck}>Download check</SpecularButton></div>
  </section>
}
