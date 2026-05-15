import { NextResponse } from "next/server"
import { API_GetAllMovies } from "@/src/api/API_Movie"
import {
  buildBookingChatbotSystemPrompt,
  CINEMA_HOTLINE,
  CINEMA_NAME,
} from "@/src/lib/cinema-chat-prompt"
import {
  DEFAULT_CHAT_SUGGESTIONS,
  getGreetingReply,
  getQuotaFallbackReply,
  getSuggestionsForUserMessage,
  isGeminiQuotaError,
  isGreetingMessage,
  tryLocalChatReply,
  type MovieSnippet,
} from "@/src/lib/cinema-chat-fallback"

export const runtime = "nodejs"

type ChatMessage = { role: "user" | "assistant"; content: string }

type ChatRequestBody = {
  messages?: ChatMessage[]
  orderStatus?: string
}

const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.0-flash"] as const

async function loadShowingMovies(): Promise<MovieSnippet[]> {
  try {
    const res = await API_GetAllMovies()
    if (!res.success || !Array.isArray(res.data?.movies)) return []
    return res.data.movies
      .filter((m) => m.status === "NOW_SHOWING")
      .slice(0, 30)
      .map((m) => ({
        id: m.id,
        title: m.title,
        genre: m.genre,
        age_rating: m.age_rating,
        duration_minutes: m.duration_minutes,
      }))
  } catch {
    return []
  }
}

async function loadMoviesContext(): Promise<string> {
  const showing = await loadShowingMovies()
  return JSON.stringify(showing, null, 0)
}

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; quota: boolean; message: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const geminiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: toGeminiContents(messages),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    }),
  })

  const data = (await geminiRes.json()) as {
    error?: { message?: string; status?: string }
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }

  if (!geminiRes.ok) {
    const msg = data.error?.message ?? `Gemini ${geminiRes.status}`
    return { ok: false, quota: isGeminiQuotaError(msg) || geminiRes.status === 429, message: msg }
  }

  const reply =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim() || ""

  if (!reply) {
    return { ok: false, quota: false, message: "Empty response" }
  }

  return { ok: true, reply }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  const userText = lastUser?.content?.trim() ?? ""

  if (!userText) {
    return NextResponse.json({ error: "Tin nhắn trống." }, { status: 400 })
  }

  const suggestions = getSuggestionsForUserMessage(userText)
  const movies = await loadShowingMovies()

  // Lời chào: trả lời + gợi ý ngay, không gọi Gemini (tránh quota & UX tốt hơn)
  if (isGreetingMessage(userText)) {
    return NextResponse.json({
      reply: getGreetingReply(),
      suggestions: [...DEFAULT_CHAT_SUGGESTIONS],
      source: "local",
    })
  }

  // FAQ + danh sách phim thật — không cần Gemini
  const localReply = tryLocalChatReply(userText, movies)
  if (localReply) {
    return NextResponse.json({
      reply: localReply,
      suggestions: getSuggestionsForUserMessage(userText),
      source: "local",
    })
  }

  if (!apiKey) {
    return NextResponse.json({
      reply: `${getQuotaFallbackReply()} Thêm GEMINI_API_KEY vào .env.local để bật trả lời AI.`,
      suggestions,
      source: "local",
    })
  }

  const moviesJson = JSON.stringify(movies, null, 0)
  const systemPrompt = buildBookingChatbotSystemPrompt({
    moviesJson,
    promotions: "Giảm 10% combo bắp nước khi mua từ 2 vé; Thành viên Silver/Gold được tích điểm đổi quà.",
    orderStatus: body.orderStatus?.trim() || "Chưa có đơn đang xử lý",
  })

  try {
    let lastError = ""
    for (const model of GEMINI_MODELS) {
      const result = await callGemini(apiKey, model, systemPrompt, messages)
      if (result.ok) {
        return NextResponse.json({
          reply: result.reply,
          suggestions: getSuggestionsForUserMessage(userText),
          source: "gemini",
          model,
        })
      }
      lastError = result.message
      if (!result.quota) continue
    }

    const retryHint = isGeminiQuotaError(lastError)
      ? " (Gemini free tier đã hết quota — thử key mới hoặc bật billing trên Google AI Studio)"
      : ""

    return NextResponse.json({
      reply: `${getQuotaFallbackReply()}${retryHint}`,
      suggestions,
      source: "local",
      aiAvailable: false,
    })
  } catch {
    return NextResponse.json({
      reply: getQuotaFallbackReply(),
      suggestions,
      source: "local",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    cinema: CINEMA_NAME,
    hotline: CINEMA_HOTLINE,
    configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    defaultSuggestions: [...DEFAULT_CHAT_SUGGESTIONS],
  })
}
