/** System prompt trợ lý đặt vé — theo mục 3 trong promt.md */

export const CINEMA_NAME = "CinePro"
export const CINEMA_HOTLINE = "1900 1234"

export type ChatContext = {
  moviesJson: string
  promotions: string
  orderStatus: string
}

export function buildBookingChatbotSystemPrompt(ctx: ChatContext): string {
  return `Bạn là trợ lý đặt vé của ${CINEMA_NAME}. Nhiệm vụ: hỗ trợ người dùng đặt vé, tra cứu lịch chiếu, giải đáp thắc mắc.

Quy tắc:
- Chỉ trả lời về phim, lịch chiếu, vé, ưu đãi của rạp
- Nếu câu hỏi ngoài phạm vi, hướng dẫn liên hệ hotline: ${CINEMA_HOTLINE}
- Xưng hô: "bạn" / "mình", thân thiện, ngắn gọn
- Không bịa thông tin phim hoặc lịch chiếu

Dữ liệu hiện tại:
- Phim đang chiếu: ${ctx.moviesJson}
- Ưu đãi đang chạy: ${ctx.promotions}
- Trạng thái đơn của user (nếu có): ${ctx.orderStatus}

Trả lời tự nhiên, tối đa 4 câu. Nếu cần thêm thông tin để hỗ trợ, hỏi lại 1 câu cụ thể.`
}

export function formatConversationForPrompt(
  history: { role: string; content: string }[],
  userMessage: string,
): string {
  const lines = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Khách" : "Trợ lý"}: ${m.content}`)
  lines.push(`Khách: ${userMessage}`)
  return lines.join("\n")
}
