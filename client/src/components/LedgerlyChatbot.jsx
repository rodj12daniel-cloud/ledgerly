import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'

function formatMoney(value, currency, hidden) {
  return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function getReply(question, expenses, user, hidden) {
  const normalized = question.toLowerCase()
  if (normalized.includes('help') || normalized.includes('what can')) return 'Ask me about your total spending, top category, this month, recent expenses, or largest expense.'
  if (!expenses.length) return 'You do not have any expenses yet. Add a record from the Expenses page and I can help you find patterns.'
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const grouped = expenses.reduce((all, item) => { all[item.category] = (all[item.category] || 0) + Number(item.amount || 0); return all }, {})
  const topCategory = Object.entries(grouped).sort((first, second) => second[1] - first[1])[0]
  const latest = [...expenses].sort((first, second) => new Date(second.date) - new Date(first.date))[0]
  const largest = [...expenses].sort((first, second) => Number(second.amount) - Number(first.amount))[0]
  const now = new Date()
  const monthTotal = expenses.filter(item => { const date = new Date(item.date); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() }).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  if (normalized.includes('top') || normalized.includes('category')) return `${topCategory[0]} is your top category at ${formatMoney(topCategory[1], user.currency, hidden)}.`
  if (normalized.includes('month')) return `You have spent ${formatMoney(monthTotal, user.currency, hidden)} this month across your recorded expenses.`
  if (normalized.includes('largest') || normalized.includes('biggest')) return `${largest.description} is your largest expense at ${formatMoney(largest.amount, largest.currency || user.currency, hidden)}.`
  if (normalized.includes('recent') || normalized.includes('latest')) return `Your latest expense is ${latest.description}, recorded on ${new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
  if (normalized.includes('total') || normalized.includes('spent') || normalized.includes('much')) return `Your recorded spending totals ${formatMoney(total, user.currency, hidden)} across ${expenses.length} expenses.`
  return 'I can help with your total spending, top category, this month, recent expenses, or largest expense.'
}

export default function LedgerlyChatbot({ user, hideAmounts }) {
  const [open, setOpen] = useState(false)
  const [panelMounted, setPanelMounted] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', text: `Hi ${user.name.split(' ')[0]}. I can help you understand your Ledgerly spending.` }])
  const [loading, setLoading] = useState(false)
  const closeTimer = useRef(null)
  useEffect(() => { api('/expenses').then(setExpenses).catch(() => setExpenses([])) }, [])
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  const prompts = useMemo(() => ['How much have I spent?', 'What is my top category?', 'What did I spend this month?'], [])
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
    if (!text || loading) return
    setInput('')
    setMessages(current => [...current, { role: 'user', text }])
    setLoading(true)
    window.setTimeout(() => {
      setMessages(current => [...current, { role: 'assistant', text: getReply(text, expenses, user, hideAmounts) }])
      setLoading(false)
    }, 320)
  }
  return <div className={`ledgerly-chat ${open ? 'is-open' : ''}`}><button className="ledgerly-chat-toggle" type="button" onClick={togglePanel} aria-label={open ? 'Close Ledgerly assistant' : 'Open Ledgerly assistant'} title="Ledgerly assistant"><span className="ledgerly-ai-loader" aria-hidden="true"><span>A</span><span>I</span><i /></span><span className="ledgerly-chat-label">{open ? 'Close' : 'Ask Ledgerly'}</span></button>{panelMounted && <section className={`ledgerly-chat-panel ${open ? 'is-visible' : 'is-closing'}`} aria-label="Ledgerly assistant"><header><div><span className="eyebrow">Ledgerly assistant</span><strong>Spending companion</strong></div><button type="button" onClick={togglePanel} aria-label="Close assistant">×</button></header><div className="ledgerly-chat-messages">{messages.map((message, index) => <div className={`ledgerly-chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{loading && <div className="ledgerly-chat-message assistant typing-indicator" aria-label="Ledgerly assistant is typing"><i /><i /><i /></div>}</div><div className="ledgerly-chat-prompts">{prompts.map(prompt => <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div><form onSubmit={event => { event.preventDefault(); ask(input) }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about your spending" aria-label="Ask Ledgerly" /><button type="submit" disabled={!input.trim() || loading} aria-label="Send message">Send</button></form></section>}</div>
}
