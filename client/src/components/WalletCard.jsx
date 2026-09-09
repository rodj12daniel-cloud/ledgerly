function money(value, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function currencySymbol(currency) {
  return { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥', KRW: '₩', SGD: 'S$' }[currency] || '$'
}

const localLogos = {
  bpi: '/assets/brand-logos/BPI.png',
  bdo: '/assets/brand-logos/BDO.png',
  metrobank: '/assets/brand-logos/Metrobank.png',
  unionbank: '/assets/brand-logos/UnionBank.png',
  'security bank': '/assets/brand-logos/SecurityBank.png',
  rcbc: '/assets/brand-logos/RCBC.png',
  pnb: '/assets/brand-logos/PNB.png',
  chinabank: '/assets/brand-logos/ChinaBank.png',
  'china bank': '/assets/brand-logos/ChinaBank.png',
  landbank: '/assets/brand-logos/LandBank.png',
  'land bank': '/assets/brand-logos/LandBank.png',
  'gotyme bank': '/assets/brand-logos/GoTymeBank.png'
}

export default function WalletCard({ wallet, user, balance, hideAmount, onEdit, onRemove }) {
  const label = wallet.account || wallet.label || 'Cash'
  const logo = wallet.accountLogo || localLogos[label.toLowerCase()] || ''
  return <article className={`wallet-card ${wallet.style || 'ink'} ${wallet.moneyType === 'cash' ? 'cash-wallet' : 'account-wallet'}`}>
    <div className="wallet-card-top"><span className="wallet-brand-mark">{logo ? <img src={logo} alt={`${label} logo`} onError={event => { event.currentTarget.style.display = 'none' }} /> : <span className="cash-mark">{currencySymbol(wallet.currency || user.currency)}</span>}</span><span className="wallet-brand">{label}</span><span className="wallet-menu">•••</span></div>
    <strong>{user.name}</strong>
    <div className="wallet-balance-label">Current balance</div>
    <div className="wallet-balance">{hideAmount ? '****' : money(balance ?? wallet.balance, user.currency)}</div>
    <div className="wallet-card-actions"><button onClick={onEdit}>Edit</button><button onClick={onRemove}>Remove</button></div>
  </article>
}
