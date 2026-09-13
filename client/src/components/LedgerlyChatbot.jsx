import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

function formatMoney(value, currency, hidden) {
  return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

const faqEntries = [
  [['what is ledgerly', 'ledgerly'], 'Ledgerly is a manual personal finance workspace for recording expenses, organizing wallets, and understanding spending patterns.'],
  [['how does ledgerly work', 'how use ledgerly'], 'Add your wallets, record expenses, and use the dashboard and analytics pages to understand your money.'],
  [['what can you do', 'what do you do'], 'I can explain Ledgerly features and answer questions about your recorded spending, categories, wallets, analytics, settings, and account controls.'],
  [['is ledgerly free', 'cost money', 'price'], 'Ledgerly is currently a portfolio expense-tracking project.'],
  [['is ledgerly a bank', 'bank'], 'No. Ledgerly is not a bank and does not hold money or connect to financial institutions.'],
  [['financial advice', 'investment advice'], 'Ledgerly is not a financial adviser and does not provide investment, tax, legal, or financial advice.'],
  [['manual expense', 'manual tracking'], 'Ledgerly is designed for manual tracking. You decide which expenses and wallet balances to record.'],
  [['add expense', 'create expense', 'record expense'], 'Open Expenses and select Add expense. Enter the description, amount, currency, source, category, and date, then submit the form.'],
  [['edit expense', 'update expense', 'change expense'], 'Open Expenses, find the record, and choose Edit to update its details.'],
  [['delete expense', 'remove expense'], 'Open Expenses, choose the record action, and select Delete. Deletion requires confirmation.'],
  [['expense category', 'categories'], 'Ledgerly supports Food, Transportation, Shopping, Bills, Entertainment, Health, Education, and Other.'],
  [['expense date', 'backdate', 'future date'], 'Expenses can be recorded with a selected date so your history reflects when the spending happened.'],
  [['expense currency', 'different currency', 'foreign currency'], 'Each expense can have its original currency. Ledgerly converts supported currencies for summaries when rates are available.'],
  [['payment method', 'money type', 'source'], 'An expense can use cash, a bank account, an e-wallet, or another digital wallet source.'],
  [['add wallet', 'add account', 'create wallet'], 'Open Accounts or use Add wallet from the dashboard. Enter the wallet name, type, balance, currency, and optional branding.'],
  [['edit wallet', 'update wallet'], 'Open Accounts and choose Edit on the wallet you want to change.'],
  [['delete wallet', 'remove wallet'], 'Open Accounts, choose the wallet action, and select Remove.'],
  [['wallet balance', 'account balance'], 'Wallet balances are manual values that Ledgerly uses to calculate your total wallet balance and net worth summary.'],
  [['cash wallet', 'cash account'], 'Choose Cash as the money type when creating a wallet for physical cash.'],
  [['bank account'], 'You can display a bank account manually, but Ledgerly does not connect to or import data from the bank.'],
  [['e wallet', 'ewallet'], 'An e-wallet is a manually tracked source such as a digital payment wallet. No connection is made to the provider.'],
  [['card color', 'wallet color'], 'Wallet card colors can be selected when creating or editing a wallet, and changed from its account actions.'],
  [['dashboard', 'home page'], 'The dashboard shows wallet balances, recent expenses, account spending, summary totals, and category patterns.'],
  [['total balance', 'total wallet'], 'Total wallet balance is calculated from the balances of your saved wallets after currency conversion.'],
  [['recent expenses', 'latest expenses'], 'The dashboard shows your latest recorded expenses. Open Expenses to view the complete ledger.'],
  [['spending by account', 'account spending'], 'Spending by account groups your expenses by their selected source, such as Cash or a bank wallet.'],
  [['analytics page', 'analytics'], 'Analytics summarizes spending totals, transactions, averages, categories, trends, and insights using your selected filters.'],
  [['date range', 'filter dates', 'last 30 days'], 'Analytics can filter All time, Last 30 days, Last 90 days, or This year.'],
  [['filter category', 'category filter'], 'Use the Category filter in Analytics to focus summaries and patterns on one spending category.'],
  [['monthly movement', 'spending over time'], 'Monthly Movement shows your recorded spending across recent calendar months. Empty months may appear at zero.'],
  [['top category', 'biggest category'], 'Your top category is the category with the highest total among the currently filtered expenses.'],
  [['average expense', 'average transaction'], 'Average expense is total filtered spending divided by the number of filtered transactions.'],
  [['pie chart', 'category chart'], 'The category chart compares how your spending is distributed across categories.'],
  [['bar chart'], 'The dashboard bar chart compares category totals visually. Use the chart toggle to switch views.'],
  [['hide amounts', 'hide money', 'privacy amounts'], 'Use the amount visibility control in the sidebar to replace financial amounts with ****.'],
  [['show amounts', 'unhide amounts'], 'Use the amount visibility control again to restore financial amounts on screen.'],
  [['dark mode', 'night mode', 'midnight theme'], 'Choose Midnight or Night mode from the theme controls to use a dark interface.'],
  [['light mode', 'day mode', 'sunny theme'], 'Choose Sunny or Day mode from the theme controls to use the light interface.'],
  [['gradient theme'], 'The Gradient theme applies Ledgerly’s colorful gradient background and matching surfaces.'],
  [['sakura theme'], 'The Sakura theme applies Ledgerly’s soft pink visual style.'],
  [['aurora theme'], 'The Aurora theme applies animated lines and a dark glass interface.'],
  [['change theme', 'switch theme', 'theme'], 'Use the theme picker in the dashboard header or the theme control in the sidebar.'],
  [['profile', 'profile picture', 'avatar'], 'Open Settings to update your name, profile picture, preferred currency, and personal card color.'],
  [['change name', 'edit name'], 'Open Settings, update your name, and save your profile changes.'],
  [['change currency', 'preferred currency'], 'Open Settings to change your preferred display currency.'],
  [['change password', 'new password'], 'Password changes are handled through the account settings flow when available. Never share your password in chat.'],
  [['logout', 'log out', 'sign out'], 'Use the Logout control in the sidebar or mobile navigation to end your session.'],
  [['login', 'sign in'], 'Use the Sign in page with your email and password.'],
  [['sign up', 'register', 'create account'], 'Use the Sign up page to create an account with your name, email, password, and preferred currency.'],
  [['forgot password', 'reset password'], 'A password reset flow is not currently available in this Ledgerly build.'],
  [['privacy', 'privacy policy', 'data'], 'Ledgerly stores account details and manually entered records needed to provide the app. It does not request card numbers, CVV/CVCs, PINs, or banking credentials.'],
  [['terms', 'terms conditions', 'terms of use'], 'The Terms & Conditions explain that Ledgerly is a manual tracking tool and not a bank, payment processor, or financial adviser.'],
  [['security', 'secure', 'safe'], 'Ledgerly uses authentication and password hashing, but you should never enter sensitive banking or payment credentials.'],
  [['bank connection', 'connect bank', 'sync bank'], 'Ledgerly does not connect to banks or cards and does not automatically sync transactions.'],
  [['card number', 'cvv', 'cvc', 'pin'], 'Do not enter card numbers, CVV/CVC codes, PINs, or banking credentials in Ledgerly.'],
  [['exchange rate', 'currency conversion', 'conversion rate'], 'Currency conversion uses the app’s exchange-rate service when a non-default currency needs to be summarized.'],
  [['download check', 'net worth check', 'statement'], 'The Net worth check is available in Settings. It summarizes your wallet balances and can be downloaded as an image.'],
  [['download profile card', 'profile card'], 'The profile card in Settings can be downloaded as an image after your profile is loaded.'],
  [['delete account', 'remove account'], 'Open Settings and use the account deletion area. Deleting your account permanently removes your account and expenses.'],
  [['support', 'contact help'], 'You can ask me about Ledgerly here, or review the Privacy Policy and Terms & Conditions pages for account and data details.'],
  [['mobile', 'phone', 'responsive'], 'Ledgerly adapts its dashboard, navigation, forms, charts, and legal pages for phone screens.'],
  [['desktop', 'web version', 'laptop'], 'Ledgerly provides a wider dashboard layout on desktop while preserving the same routes and features.'],
  [['no expenses', 'empty expenses'], 'When there are no records, add your first expense from Expenses to populate the dashboard and analytics.'],
  [['expense total', 'how much spent', 'spending total'], 'I can calculate your recorded spending total from the expenses currently loaded in Ledgerly.']
]

const faqWords = new Set('a an and are can do does for how i is me my of on the to what where which with you your'.split(' '))
const CHAT_REPLY_DELAY = 5000
function tokens(value) { return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word && !faqWords.has(word)) }
function findFaq(question) {
  const questionTokens = new Set(tokens(question))
  let best = null
  let bestScore = 0
  faqEntries.forEach(([phrases, reply]) => phrases.forEach(phrase => {
    const phraseTokens = tokens(phrase); const matches = phraseTokens.filter(token => questionTokens.has(token)).length
    const score = matches / Math.max(phraseTokens.length, 1) + (question.toLowerCase().includes(phrase) ? .6 : 0)
    if (matches && score > bestScore) { bestScore = score; best = reply }
  }))
  return bestScore >= .5 ? best : null
}

function getReply(question, expenses, wallets, user, hidden) {
  const normalized = question.toLowerCase()
  const faqReply = findFaq(question)
  if (faqReply) return faqReply
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) return `Hi ${user.name.split(' ')[0]}. Ask me about your spending, wallets, or how to use Ledgerly.`
  if (normalized.includes('help') || normalized.includes('what can i ask')) return 'Ask about your total spending, top category, latest or largest expense, monthly spending, wallet balances, or any Ledgerly feature.'
  if (!expenses.length) return 'You do not have any expenses yet. Add a record from the Expenses page and I can help you find patterns.'
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const grouped = expenses.reduce((all, item) => { all[item.category] = (all[item.category] || 0) + Number(item.amount || 0); return all }, {})
  const topCategory = Object.entries(grouped).sort((first, second) => second[1] - first[1])[0]
  const latest = [...expenses].sort((first, second) => new Date(second.date) - new Date(first.date))[0]
  const largest = [...expenses].sort((first, second) => Number(second.amount) - Number(first.amount))[0]
  const now = new Date()
  const monthTotal = expenses.filter(item => { const date = new Date(item.date); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() }).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  if (normalized.includes('wallet') || normalized.includes('balance') || normalized.includes('account')) {
    if (!wallets.length) return 'You do not have any wallets yet. Add one from Accounts or the dashboard to track a balance.'
    const walletTotal = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0)
    return `You have ${wallets.length} wallet${wallets.length === 1 ? '' : 's'} with a combined recorded balance of ${formatMoney(walletTotal, user.currency, hidden)}.`
  }
  if (normalized.includes('top') || normalized.includes('category')) return `${topCategory[0]} is your top category at ${formatMoney(topCategory[1], user.currency, hidden)}.`
  if (normalized.includes('month')) return `You have spent ${formatMoney(monthTotal, user.currency, hidden)} this month across your recorded expenses.`
  if (normalized.includes('largest') || normalized.includes('biggest')) return `${largest.description} is your largest expense at ${formatMoney(largest.amount, largest.currency || user.currency, hidden)}.`
  if (normalized.includes('recent') || normalized.includes('latest')) return `Your latest expense is ${latest.description}, recorded on ${new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
  if (normalized.includes('total') || normalized.includes('spent') || normalized.includes('much')) return `Your recorded spending totals ${formatMoney(total, user.currency, hidden)} across ${expenses.length} expenses.`
  return 'I can help explain Ledgerly or answer questions about your recorded spending.'
}

export default function LedgerlyChatbot({ user, hideAmounts }) {
  const [open, setOpen] = useState(false)
  const [panelMounted, setPanelMounted] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [wallets, setWallets] = useState([])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', text: `Hi ${user.name.split(' ')[0]}. I can help you understand your Ledgerly spending.` }])
  const [loading, setLoading] = useState(false)
  const closeTimer = useRef(null)
  const replyTimer = useRef(null)
  const busyRef = useRef(false)
  useEffect(() => {
    Promise.allSettled([api('/expenses'), api('/wallets')]).then(([expenseResult, walletResult]) => {
      if (expenseResult.status === 'fulfilled') setExpenses(expenseResult.value)
      if (walletResult.status === 'fulfilled') setWallets(walletResult.value)
    })
  }, [])
  useEffect(() => () => { window.clearTimeout(closeTimer.current); window.clearTimeout(replyTimer.current) }, [])
  function togglePanel() {
    window.clearTimeout(closeTimer.current)
    if (open) {
      setOpen(false)
      closeTimer.current = window.setTimeout(() => setPanelMounted(false), 220)
      return
    }
    setPanelMounted(true)
    window.requestAnimationFrame(() => setOpen(true))
  }
  function ask(question) {
    const text = question.trim()
    if (!text || busyRef.current) return
    busyRef.current = true
    setInput('')
    setMessages(current => [...current, { role: 'user', text }])
    setLoading(true)
    replyTimer.current = window.setTimeout(() => {
      setMessages(current => [...current, { role: 'assistant', text: getReply(text, expenses, wallets, user, hideAmounts) }])
      setLoading(false)
      busyRef.current = false
    }, CHAT_REPLY_DELAY)
  }
  return <div className={`ledgerly-chat ${open ? 'is-open' : ''}`}><button className="ledgerly-chat-toggle" type="button" onClick={togglePanel} aria-label={open ? 'Close Ledgerly assistant' : 'Open Ledgerly assistant'} title="Ledgerly assistant"><span className="ledgerly-ai-loader" aria-hidden="true"><span>A</span><span>I</span><i /></span><span className="ledgerly-chat-label">{open ? 'Close' : 'Ask Ledgerly'}</span></button>{panelMounted && <section className={`ledgerly-chat-panel ${open ? 'is-visible' : 'is-closing'}`} aria-label="Ledgerly assistant"><header><div><span className="eyebrow">Ledgerly assistant</span><strong>Spending companion</strong></div><button type="button" onClick={togglePanel} aria-label="Close assistant">×</button></header><div className="ledgerly-chat-messages">{messages.map((message, index) => <div className={`ledgerly-chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{loading && <div className="ledgerly-chat-message assistant typing-indicator" aria-label="Ledgerly assistant is typing"><i /><i /><i /></div>}</div><form onSubmit={event => { event.preventDefault(); ask(input) }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask Ledgerly anything" aria-label="Ask Ledgerly" /><button type="submit" disabled={!input.trim() || loading} aria-label="Send message">Send</button></form></section>}</div>
}
