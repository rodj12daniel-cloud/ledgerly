import { Link } from 'react-router-dom'

const sections = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    intro: 'Ledgerly is a portfolio expense-tracking project. This policy explains the limited information the app stores and why.',
    items: [
      ['What we store', 'When you create an account, Ledgerly stores your name, email address, a securely hashed password, preferred currency, preferred theme, and the expenses you manually add.'],
      ['Why we store it', 'This information is used to authenticate your account, show your profile, display your expenses, and calculate your personal dashboard totals.'],
      ['What we never request', 'Ledgerly does not connect to banks or cards and does not request or store card numbers, CVV/CVC codes, PINs, banking credentials, or payment details.'],
      ['Your control', 'You can update your name, currency, and theme in Settings. Deleting your account permanently removes your account and its expenses.'],
      ['Security note', 'Ledgerly uses standard authentication and password hashing for this project. No online service can promise complete security, so never enter sensitive financial credentials here.']
    ]
  },
  terms: {
    eyebrow: 'Guidelines',
    title: 'Terms & Conditions',
    intro: 'By using Ledgerly, you agree to use it as a simple personal expense-tracking tool.',
    items: [
      ['Manual tracking only', 'Ledgerly does not hold money, process payments, connect to financial accounts, or verify transaction data. All records are entered manually by you.'],
      ['No financial advice', 'Ledgerly is not a bank, financial planner, accounting service, or source of financial, investment, tax, or legal advice.'],
      ['Keep credentials private', 'Do not enter card numbers, CVV/CVC codes, PINs, banking credentials, or other sensitive payment information into Ledgerly. Protect your account password.'],
      ['Accurate use', 'You are responsible for the information you enter and for keeping your login details private. Do not use the app for unlawful activity or to access another person’s data.'],
      ['Account deletion', 'You may delete your account from Settings. This permanently removes your account and all expenses associated with it.']
    ]
  }
}

export default function Legal({ type, user }) {
  const page = sections[type]
  const returnPath = user ? '/' : '/login'
  const returnLabel = user ? 'Back to dashboard' : 'Back to sign in'
  return <div className="legal-page"><div className="legal-top"><Link className="brand" to={returnPath}><img src="/assets/images/Black%20and%20Gold%20Elegant%20Banking%20Finance%20Logo%20(1).png" alt="Ledgerly" /></Link><Link className="button secondary" to={returnPath}>{returnLabel}</Link></div><main className="legal-card"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p className="legal-intro">{page.intro}</p><div className="legal-sections">{page.items.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}</div><p className="legal-footer">Questions about your data? Review the Settings page or delete your account from your profile.</p></main></div>
}
