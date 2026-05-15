'use client'

import { MessageCircle, Send, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CINEMA_HOTLINE, CINEMA_NAME } from '@/src/lib/cinema-chat-prompt'
import {
  DEFAULT_CHAT_SUGGESTIONS,
  getGreetingReply,
  getQuotaFallbackReply,
  getSuggestionsForUserMessage,
  isGreetingMessage,
} from '@/src/lib/cinema-chat-fallback'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Chào bạn! Mình là trợ lý đặt vé ${CINEMA_NAME}. Chọn câu hỏi gợi ý bên dưới hoặc nhập câu hỏi của bạn nhé.`,
  suggestions: [...DEFAULT_CHAT_SUGGESTIONS],
}

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function SuggestionChips({
  items,
  disabled,
  onPick,
}: {
  items: string[]
  disabled?: boolean
  onPick: (text: string) => void
}) {
  if (!items.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map(label => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(label)}
          className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-left text-[11px] font-semibold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/20 disabled:opacity-40"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function BoxChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (open) {
      scrollToBottom()
      window.setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open, messages, scrollToBottom])

  const sendMessage = useCallback(async (rawText: string) => {
    const text = rawText.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { id: newId(), role: 'user', content: text }

    // Trả lời local ngay khi chào — không cần gọi API
    if (isGreetingMessage(text)) {
      setMessages(prev => [
        ...prev,
        userMsg,
        {
          id: newId(),
          role: 'assistant',
          content: getGreetingReply(),
          suggestions: [...DEFAULT_CHAT_SUGGESTIONS],
        },
      ])
      setInput('')
      return
    }

    const historyForApi = [...messages, userMsg]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      })
      const data = (await res.json()) as {
        reply?: string
        suggestions?: string[]
        error?: string
      }

      const reply =
        data.reply ??
        (res.ok ? 'Mình chưa có câu trả lời.' : getQuotaFallbackReply())
      const suggestions =
        Array.isArray(data.suggestions) && data.suggestions.length > 0
          ? data.suggestions
          : getSuggestionsForUserMessage(text)

      setMessages(prev => [
        ...prev,
        { id: newId(), role: 'assistant', content: reply, suggestions },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: getQuotaFallbackReply(),
          suggestions: getSuggestionsForUserMessage(text),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [loading, messages])

  function handleSend() {
    void sendMessage(input)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý đặt vé"
          className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-black shadow-[0_8px_32px_rgba(250,204,21,0.45)] transition hover:scale-105 hover:bg-yellow-400"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      ) : (
        <ChatPanel
          onClose={() => setOpen(false)}
          messages={messages}
          loading={loading}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onPickSuggestion={text => void sendMessage(text)}
          onKeyDown={onKeyDown}
          listRef={listRef}
          inputRef={inputRef}
        />
      )}
    </>
  )
}

function ChatPanel({
  onClose,
  messages,
  loading,
  input,
  setInput,
  onSend,
  onPickSuggestion,
  onKeyDown,
  listRef,
  inputRef,
}: {
  onClose: () => void
  messages: ChatMessage[]
  loading: boolean
  input: string
  setInput: (v: string) => void
  onSend: () => void
  onPickSuggestion: (text: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  listRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  const activeSuggestions = lastAssistant?.suggestions ?? []

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex h-[min(560px,calc(100vh-48px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      role="dialog"
      aria-label="Trợ lý đặt vé"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-violet-600/15 px-4 py-3">
        <div>
          <p className="text-sm font-black text-white">Trợ lý {CINEMA_NAME}</p>
          <p className="text-[10px] font-medium text-slate-500">Hỗ trợ đặt vé · lịch chiếu</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Đóng chat"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-yellow-500 font-medium text-black'
                  : 'border border-white/10 bg-white/[0.06] text-slate-200'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'assistant' && m.suggestions && m.suggestions.length > 0 && (
              <SuggestionChips
                items={m.suggestions}
                disabled={loading}
                onPick={onPickSuggestion}
              />
            )}
          </div>
        ))}
        {loading && (
          <p className="text-xs font-medium text-slate-500 animate-pulse">Đang trả lời...</p>
        )}
      </div>

      {!loading && activeSuggestions.length > 0 && (
        <div className="shrink-0 border-t border-white/5 px-4 pb-2 pt-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Gợi ý câu hỏi
          </p>
          <SuggestionChips items={activeSuggestions} disabled={loading} onPick={onPickSuggestion} />
        </div>
      )}

      <footer className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Nhập câu hỏi..."
            disabled={loading}
            className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40"
            aria-label="Gửi"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          Hotline: {CINEMA_HOTLINE}
        </p>
      </footer>
    </div>
  )
}
