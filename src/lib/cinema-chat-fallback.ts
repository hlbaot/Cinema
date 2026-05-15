import { CINEMA_HOTLINE, CINEMA_NAME } from "@/src/lib/cinema-chat-prompt"

/** Câu gợi ý mặc định khi mở chat hoặc sau lời chào */
export const DEFAULT_CHAT_SUGGESTIONS = [
  "Phim đang chiếu hôm nay?",
  "Gợi ý phim cho 2 người",
  "Lịch chiếu cuối tuần",
  "Ưu đãi combo bắp nước",
] as const

export type MovieSnippet = {
  id: string
  title: string
  genre: string[]
  age_rating: string
  duration_minutes: number
}

const GREETING_RE =
  /^(hi|hello|hey|chào|xin chào|chao|yo|hế lô|helo|chao ban|chào bạn|chào mình)[\s!.?]*$/i

export function isGreetingMessage(text: string): boolean {
  const t = text.trim()
  if (!t || t.length > 40) return false
  return GREETING_RE.test(t)
}

export function getGreetingReply(): string {
  return `Chào bạn! Mình là trợ lý ${CINEMA_NAME}. Bạn muốn xem phim gì, tra lịch chiếu hay hỏi về ưu đãi? Chọn một gợi ý bên dưới hoặc nhập câu hỏi nhé.`
}

export function getSuggestionsForUserMessage(text: string): string[] {
  const t = text.trim().toLowerCase()
  if (isGreetingMessage(text)) {
    return [...DEFAULT_CHAT_SUGGESTIONS]
  }
  if (t.includes("phim") && (t.includes("gợi") || t.includes("goi") || t.includes("đề xuất"))) {
    return [
      "Phim hành động đang hot",
      "Phim cho gia đình có trẻ em",
      "Phim chiếu tối thứ 7",
    ]
  }
  if (t.includes("lịch") || t.includes("lich") || t.includes("suất")) {
    return [
      "Suất chiếu tối nay",
      "Suất sáng cuối tuần",
      "Phòng IMAX có suất nào?",
    ]
  }
  if (t.includes("vé") || t.includes("đặt") || t.includes("dat")) {
    return [
      "Cách đặt vé online",
      "Ghế VIP còn trống không?",
      "Thanh toán bằng PayOS",
    ]
  }
  if (t.includes("bắp") || t.includes("combo") || t.includes("nước")) {
    return [
      "Combo 2 người giá bao nhiêu?",
      "Có giảm giá combo khi mua 2 vé?",
    ]
  }
  return [
    "Phim đang chiếu hôm nay?",
    "Hướng dẫn đặt vé",
    `Gọi hotline ${CINEMA_HOTLINE}`,
  ]
}

/** Thông báo khi Gemini hết quota — không phải lỗi API rạp */
export function getQuotaFallbackReply(): string {
  return `Dịch vụ AI (Google Gemini) đang tạm quá tải hoặc hết hạn mức miễn phí. Mình vẫn trả lời được các câu gợi ý bên dưới; cần gấp gọi hotline ${CINEMA_HOTLINE}.`
}

export function isGeminiQuotaError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes("quota") ||
    m.includes("429") ||
    m.includes("rate limit") ||
    m.includes("resource_exhausted")
  )
}

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

function formatMovieLine(m: MovieSnippet, index: number): string {
  const genres = Array.isArray(m.genre) ? m.genre.join(", ") : ""
  return `${index + 1}. ${m.title} (${m.age_rating}, ${m.duration_minutes} phút${genres ? ` · ${genres}` : ""})`
}

/**
 * Trả lời offline từ dữ liệu phim + FAQ — không cần Gemini.
 * Trả null nếu không khớp pattern để gọi AI (khi còn quota).
 */
export function tryLocalChatReply(userText: string, movies: MovieSnippet[]): string | null {
  const t = normalize(userText)
  const showing = movies.slice(0, 8)

  if (
    t.includes("phim dang chieu") ||
    t.includes("phim hom nay") ||
    t === "phim dang chieu hom nay?" ||
    t.includes("dang chieu")
  ) {
    if (showing.length === 0) {
      return `Hiện chưa lấy được danh sách phim từ hệ thống. Bạn vào mục Phim hoặc Lịch chiếu trên web, hoặc gọi ${CINEMA_HOTLINE}.`
    }
    const list = showing.map((m, i) => formatMovieLine(m, i)).join("\n")
    return `Phim đang chiếu tại ${CINEMA_NAME}:\n${list}\n\nBấm Phim trên menu để xem chi tiết và đặt vé nhé.`
  }

  if (t.includes("goi y") || t.includes("2 nguoi") || t.includes("hai nguoi")) {
    const picks = showing.slice(0, 3)
    if (picks.length === 0) {
      return `Bạn cho mình biết thể loại thích (hành động, tình cảm, hoạt hình…) hoặc xem mục Phim trên web nhé.`
    }
    const names = picks.map((m) => m.title).join(", ")
    return `Gợi ý cho 2 người: ${names}. Ghế đôi (couple) hoặc 2 ghế standard liền kề — chọn suất ở Lịch chiếu rồi chọn ghế trên sơ đồ.`
  }

  if (t.includes("lich chieu") || t.includes("cuoi tuan") || t.includes("suat chieu")) {
    return `Xem lịch chiếu đầy đủ tại menu Lịch chiếu trên web. Chọn phim → suất → ghế → bắp nước (tuỳ chọn) → thanh toán PayOS.`
  }

  if (t.includes("combo") || t.includes("bap") || t.includes("nuoc") || t.includes("uu dai")) {
    return `Ưu đãi: giảm 10% combo bắp nước khi mua từ 2 vé; thành viên Silver/Gold tích điểm đổi quà. Combo gợi ý khi đặt vé ở bước chọn bắp nước.`
  }

  if (t.includes("dat ve") || t.includes("cach dat") || t.includes("huong dan")) {
    return `Đặt vé online: (1) Chọn phim → (2) Chọn suất & ghế → (3) Thêm combo (tuỳ chọn) → (4) Thanh toán PayOS. Cần hỗ trợ gọi ${CINEMA_HOTLINE}.`
  }

  if (t.includes("hotline") || t.includes("lien he")) {
    return `Hotline ${CINEMA_NAME}: ${CINEMA_HOTLINE}. Giờ hỗ trợ theo quy định rạp.`
  }

  if (t.includes("payos") || t.includes("thanh toan")) {
    return `Thanh toán qua PayOS: quét QR hoặc chuyển khoản đúng số tiền trên màn hình. Sau khi thành công vé được xác nhận tự động.`
  }

  // Khớp tên phim trong câu hỏi
  const byTitle = showing.find((m) => t.includes(normalize(m.title)))
  if (byTitle) {
    const genres = Array.isArray(byTitle.genre) ? byTitle.genre.join(", ") : ""
    return `${byTitle.title}: ${byTitle.duration_minutes} phút, ${byTitle.age_rating}${genres ? `, thể loại ${genres}` : ""}. Vào trang Phim → chọn phim để đặt vé.`
  }

  return null
}

export function parseMoviesFromJson(moviesJson: string): MovieSnippet[] {
  try {
    const parsed = JSON.parse(moviesJson) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === "object")
      .map((m) => ({
        id: String(m.id ?? ""),
        title: String(m.title ?? ""),
        genre: Array.isArray(m.genre) ? (m.genre as string[]) : [],
        age_rating: String(m.age_rating ?? ""),
        duration_minutes: Number(m.duration_minutes) || 0,
      }))
      .filter((m) => m.id && m.title)
  } catch {
    return []
  }
}
