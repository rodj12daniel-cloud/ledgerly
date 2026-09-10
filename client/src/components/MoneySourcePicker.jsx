import { useMemo, useState } from 'react'

const types = [
  ['cash', 'Cash', 'Simple cash spending', '2E7D32'],
  ['bank', 'Bank', 'Bank account spending', '287B86'],
  ['ewallet', 'E-wallet', 'Local wallet apps', '007DFE'],
  ['digital-wallet', 'Digital Wallet', 'Device wallet spending', '303942']
]

const cardColors = [
  ['Red', '#C81D35'], ['Blue', '#1769AA'], ['Green', '#2E7D32'], ['Gold', '#D39B2A'], ['Purple', '#7048A8'],
  ['Black', '#20252B'], ['White', '#E9EEF2'], ['Orange', '#D66A28'], ['Teal', '#168B91'], ['Pink', '#C65383']
]

const sources = {
  bank: [
    ['BPI', '#B31B1B', '/assets/brand-logos/BPI.png'],
    ['BDO', '#0066B3', '/assets/brand-logos/BDO.png'],
    ['Metrobank', '#0066B3', '/assets/brand-logos/Metrobank.png'],
    ['UnionBank', '#E31B23', '/assets/brand-logos/UnionBank.png'],
    ['Security Bank', '#ED1C24', '/assets/brand-logos/SecurityBank.png'],
    ['RCBC', '#0054A6', '/assets/brand-logos/RCBC.png'],
    ['PNB', '#0054A6', '/assets/brand-logos/PNB.png'],
    ['Chinabank', '#C8102E', '/assets/brand-logos/ChinaBank.png'],
    ['LandBank', '#007A33', '/assets/brand-logos/LandBank.png'],
    ['GoTyme Bank', '#6C2DB9', '/assets/brand-logos/GoTymeBank.png'],
    ['Other Bank', '#667085', '']
  ],
  ewallet: [
    ['GCash', '#007DFE', 'https://cdn.simpleicons.org/gcash/007DFE'],
    ['Maya', '#00A86B', 'https://cdn.simpleicons.org/maya/00A86B'],
    ['GrabPay', '#00B14F', 'https://cdn.simpleicons.org/grab/00B14F'],
    ['ShopeePay', '#EE4D2D', 'https://cdn.simpleicons.org/shopee/EE4D2D'],
    ['Coins.ph', '#1677FF', 'https://cdn.simpleicons.org/coinsph/1677FF'],
    ['GoTyme', '#6C2DB9', 'https://cdn.simpleicons.org/gotyme/6C2DB9'],
    ['Other E-wallet', '#667085', '']
  ],
  'digital-wallet': [
    ['Apple Pay', '#111111', 'https://cdn.simpleicons.org/applepay/111111'],
    ['Google Pay', '#4285F4', 'https://cdn.simpleicons.org/googlepay/4285F4'],
    ['Samsung Pay', '#1428A0', 'https://cdn.simpleicons.org/samsungpay/1428A0']
  ]
}

export default function MoneySourcePicker({ value, onChange, wallets = [] }) {
  const selectedType = value.moneyType || 'cash'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const options = useMemo(() => {
    const builtIn = sources[selectedType] || []
    const custom = wallets
      .filter(wallet => wallet.moneyType === selectedType && !builtIn.some(option => option[0] === (wallet.account || wallet.label)))
      .map(wallet => [wallet.account || wallet.label, wallet.accountColor || '#667085', wallet.accountLogo || ''])
    return [...builtIn, ...custom]
  }, [selectedType, wallets])
  const visibleOptions = options.filter(([account]) => account.toLowerCase().includes(search.toLowerCase()))

  function chooseType(moneyType) {
    const defaultColor = types.find(item => item[0] === moneyType)?.[3]
    onChange({ moneyType, account: moneyType === 'cash' ? 'Cash' : '', accountColor: defaultColor ? `#${defaultColor}` : '#667085', accountLogo: '' })
  }

  function chooseAccount([account, accountColor, accountLogo]) {
    onChange({ account, accountColor, accountLogo })
  }

  function chooseColor(accountColor) {
    onChange({ accountColor })
  }

  const isCustom = value.account === 'Other Bank' || value.account === 'Other E-wallet'

  return <div className="money-source-picker">
    <div className="source-label-row"><span className="form-section-label">1. Money type</span><span className="source-helper">Where the expense came from</span></div>
    <div className="money-type-grid">
      {types.map(([id, label, description, color]) => <button type="button" key={id} className={`money-type-card ${selectedType === id ? 'selected' : ''}`} style={{ '--source-accent': `#${color}` }} onClick={() => chooseType(id)}>
        <span className="money-type-icon">{id === 'cash' ? '$' : id === 'bank' ? 'B' : id === 'ewallet' ? 'E' : 'D'}</span><strong>{label}</strong><small>{description}</small>
      </button>)}
    </div>
    {selectedType !== 'cash' && <div className="card-color-picker"><div className="source-label-row"><span className="form-section-label">Card color</span><span className="source-helper">Choose a visual style</span></div><div className="card-color-options">{cardColors.map(([name, color]) => <button type="button" key={name} className={`card-color-option ${value.accountColor?.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`} style={{ '--swatch': color }} onClick={() => chooseColor(color)} aria-label={`${name} card color`} title={name}><i></i><span>{name}</span></button>)}</div></div>}
    {selectedType === 'cash' ? <div className="cash-confirm">
      <span className="source-check">₱</span><div><strong>Cash voucher</strong><small>The selected color will be used for this cash card.</small></div>
    </div> : <>
      <div className="source-label-row account-label"><span className="form-section-label">2. Choose account</span><span className="source-helper">Select a source</span></div>
      <div className="source-browser">
        <label className="source-search"><span>?</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search banks & wallets..." /></label>
        <div className="source-tabs">{[['all', 'All'], ['bank', 'Banks'], ['digital-wallet', 'Digital Wallets'], ['ewallet', 'E-Wallets']].map(([id, label]) => <button type="button" className={filter === id ? 'active' : ''} key={id} onClick={() => { setFilter(id); if (id !== 'all') chooseType(id) }}>{label}</button>)}</div>
        <div className="source-group-title"><strong>{selectedType === 'bank' ? 'Banks' : selectedType === 'ewallet' ? 'E-Wallets' : 'Digital wallets'}</strong><span>{visibleOptions.length}</span></div>
        <div className="source-card-grid">{visibleOptions.map(option => <button type="button" key={option[0]} className={`source-card ${value.account === option[0] ? 'selected' : ''}`} style={{ '--source-accent': option[1] }} onClick={() => chooseAccount(option)}>
          {option[2] ? <img src={option[2]} alt="" onError={event => { event.currentTarget.style.display = 'none' }} /> : <span className="source-placeholder">{option[0].slice(0, 1)}</span>}
          <span>{option[0]}</span><small>{selectedType === 'bank' ? 'Bank' : selectedType === 'ewallet' ? 'E-Wallet' : 'Digital Wallet'}</small>{value.account === option[0] && <b>OK</b>}
        </button>)}</div>
      </div>
      {isCustom && <div className="custom-source-fields"><label>Custom account name<input value={value.customAccount || ''} onChange={event => onChange({ account: event.target.value, customAccount: event.target.value, accountLogo: '' })} placeholder="e.g. Family bank" /></label><label>Accent color<input type="color" value={value.accountColor || '#667085'} onChange={event => onChange({ accountColor: event.target.value })} /></label></div>}
    </>}
  </div>
}
