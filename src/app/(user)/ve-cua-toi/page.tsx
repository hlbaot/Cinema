"use client";

import Cookies from "js-cookie";
import {
  CalendarClock,
  Clapperboard,
  Clock3,
  CreditCard,
  X,
  MapPin,
  ReceiptText,
  RefreshCcw,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_GetBookingDetail, API_GetMyBookings } from "@/src/api/API_Booking";

type TicketStatus = "paid" | "pending" | "cancelled" | "checked_in" | "unknown";

type MyTicket = {
  id: string;
  code: string;
  ticketCode: string;
  movieTitle: string;
  posterUrl: string;
  roomName: string;
  cinemaName: string;
  showtime: string;
  createdAt: string;
  seats: string[];
  total: number;
  status: TicketStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function textValue(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

function numberValue(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}

function nestedRecord(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (isRecord(value)) return value;
  }

  return {};
}

function normalizeSeats(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((seat) => {
      if (typeof seat === "string" || typeof seat === "number") return String(seat);
      if (isRecord(seat)) {
        const row = textValue(seat, "seat_row", "seatRow", "row");
        const number = textValue(seat, "seat_number", "seatNumber", "number");
        if (row && number) return `${row}${number}`;
        return textValue(seat, "seat_label", "seatLabel", "label", "name", "code", "seat_id", "seatId");
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeStatus(raw: string): TicketStatus {
  const status = raw.toLowerCase();
  if (["paid", "completed", "success", "confirmed"].includes(status)) return "paid";
  if (["pending", "unpaid", "waiting"].includes(status)) return "pending";
  if (["cancelled", "canceled", "failed", "expired"].includes(status)) return "cancelled";
  if (["checked_in", "checked-in", "used"].includes(status)) return "checked_in";
  return "unknown";
}

function mergeShowDateTime(showDate: string, startTime: string) {
  if (!showDate && !startTime) return "";
  if (showDate.includes("T")) return showDate;
  if (startTime.includes("T")) return startTime;
  if (showDate && startTime) return `${showDate}T${startTime}`;
  return showDate || startTime;
}

function findList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  const directKeys = ["bookings", "tickets", "items", "data", "results"];
  for (const key of directKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  if (isRecord(payload.data)) {
    for (const key of directKeys) {
      const value = payload.data[key];
      if (Array.isArray(value)) return value;
    }
  }

  return [];
}

function normalizeTicket(item: unknown, index: number): MyTicket | null {
  if (!isRecord(item)) return null;

  const root = isRecord(item.data) ? item.data : item;
  const booking = nestedRecord(root, "booking");
  const ticket = nestedRecord(root, "ticket");
  const movie = nestedRecord(root, "movie");
  const showtime = nestedRecord(root, "showtime", "session");
  const room = nestedRecord(showtime, "room");
  const cinema = nestedRecord(showtime, "cinema");
  const source = { ...booking, ...ticket, ...root };

  const id = textValue(source, "id", "booking_id", "bookingId", "ticket_id", "ticketId") || `ticket-${index}`;
  const movieTitle =
    textValue(source, "movie_title", "movieTitle") ||
    textValue(movie, "title", "name") ||
    textValue(nestedRecord(booking, "movie"), "title", "name") ||
    "Phim chưa cập nhật";
  const posterUrl =
    textValue(source, "poster_url", "posterUrl", "poster") ||
    textValue(movie, "poster_url", "posterUrl", "poster") ||
    textValue(nestedRecord(booking, "movie"), "poster_url", "posterUrl", "poster");
  const status = normalizeStatus(textValue(source, "status", "booking_status", "bookingStatus", "payment_status", "paymentStatus"));
  const seats = normalizeSeats(source.seats ?? source.showtime_seats ?? source.showtimeSeats ?? booking.seats);
  const showDate = textValue(showtime, "show_date", "showDate");
  const startTime = textValue(showtime, "start_time", "startTime");
  const showtimeText =
    mergeShowDateTime(showDate, startTime) ||
    textValue(source, "showtime_start", "showtimeStart", "start_time", "startTime") ||
    textValue(showtime, "start_time", "startTime");

  return {
    id,
    code: textValue(source, "booking_code", "bookingCode", "code") || id,
    ticketCode: textValue(source, "ticket_code", "ticketCode"),
    movieTitle,
    posterUrl,
    roomName: textValue(source, "room_name", "roomName") || textValue(showtime, "room_name", "roomName") || textValue(room, "name", "room_name", "roomName"),
    cinemaName: textValue(source, "cinema_name", "cinemaName") || textValue(showtime, "cinema_name", "cinemaName") || textValue(cinema, "name", "cinema_name", "cinemaName"),
    showtime: showtimeText,
    createdAt: textValue(source, "created_at", "createdAt", "booking_date", "bookingDate"),
    seats,
    total: numberValue(source, "total_price", "totalPrice", "total", "amount"),
    status,
  };
}

function formatDateTime(value: string) {
  if (!value) return "Chưa cập nhật";
  const normalizedValue = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(value)
    ? value.replace(/\s+/, "T")
    : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} • ${date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}

function formatBookingDate(value: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusMeta(status: TicketStatus) {
  switch (status) {
    case "paid":
      return { label: "Đã thanh toán", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" };
    case "pending":
      return { label: "Chờ thanh toán", className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300" };
    case "cancelled":
      return { label: "Đã hủy", className: "border-red-400/20 bg-red-400/10 text-red-300" };
    case "checked_in":
      return { label: "Đã check-in", className: "border-sky-400/20 bg-sky-400/10 text-sky-300" };
    default:
      return { label: "Chưa cập nhật", className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300" };
  }
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const accessToken = Cookies.get("ACCESS_TOKEN") ?? Cookies.get("access_token");
      if (!accessToken) {
        setTickets([]);
        setTotalTickets(0);
        return;
      }
      const response = await API_GetMyBookings(accessToken, 1, 10);
      const normalized = findList(response)
        .map(normalizeTicket)
        .filter((ticket): ticket is MyTicket => Boolean(ticket));
      const detailed = await Promise.all(
        normalized.map(async (ticket, index) => {
          try {
            const detail = await API_GetBookingDetail(ticket.id, accessToken);
            return normalizeTicket(detail, index) ?? ticket;
          } catch (detailError) {
            console.warn("Failed to load booking detail:", ticket.id, detailError);
            return ticket;
          }
        }),
      );

      setTickets(detailed);
      setTotalTickets(isRecord(response) && typeof response.total === "number" ? response.total : detailed.length);
    } catch (err) {
      console.warn("Failed to load my tickets:", err);
      setError("Không tải được danh sách vé.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const stats = useMemo(() => {
    const paid = tickets.filter((ticket) => ticket.status === "paid" || ticket.status === "checked_in").length;
    const pending = tickets.filter((ticket) => ticket.status === "pending").length;
    const total = tickets.reduce((sum, ticket) => sum + ticket.total, 0);

    return { paid, pending, total };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-[#0f1110] px-4 pb-16 pt-24 text-white sm:px-6 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-yellow-500">CinePro</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Vé của tôi</h1>
          </div>
          <button
            type="button"
            onClick={loadTickets}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/10 px-5 py-3 text-sm font-black text-zinc-100 transition hover:border-yellow-400/35 hover:bg-yellow-400/10 hover:text-yellow-200"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-3">
          <SummaryTile icon={Ticket} label="Tổng vé" value={totalTickets.toLocaleString("vi-VN")} />
          <SummaryTile icon={CalendarClock} label="Còn hiệu lực" value={stats.paid.toLocaleString("vi-VN")} />
          <SummaryTile icon={CreditCard} label="Đã chi" value={formatVnd(stats.total)} />
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-xl border border-white/10 bg-white/[0.05]" />
            ))}
          </div>
        ) : tickets.length ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={`${ticket.id}-${ticket.ticketCode}`} ticket={ticket} onOpen={() => setSelectedTicket(ticket)} />
            ))}
          </div>
        ) : (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-zinc-900/45 px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
              <Ticket className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Chưa có vé nào</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">Các vé đã đặt và thanh toán sẽ xuất hiện tại đây.</p>
            <Link
              href="/lichChieu"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
            >
              Xem lịch chiếu
            </Link>
          </section>
        )}
      </div>

      {selectedTicket ? (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      ) : null}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-xl border border-white/10 bg-[#20211f] p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-yellow-500">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black tracking-widest text-amber-100">{label}</p>
        <p className="mt-1 truncate text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onOpen }: { ticket: MyTicket; onOpen: () => void }) {
  const meta = statusMeta(ticket.status);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="overflow-hidden rounded-xl border border-white/10 bg-[#20211f] transition hover:border-yellow-400/35 hover:bg-[#24251f] focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
    >
      <div className="flex flex-col gap-0 sm:flex-row">
        <div className="relative h-40 overflow-hidden bg-zinc-950 sm:h-auto sm:w-36 md:w-44">
          {ticket.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ticket.posterUrl} alt={ticket.movieTitle} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.28),transparent_18rem),linear-gradient(145deg,#101010,#2a2118_54%,#080808)] p-4">
              <Clapperboard className="h-8 w-8 text-yellow-500/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent sm:bg-linear-to-r sm:from-transparent sm:to-[#20211f]/10" />
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-yellow-500">
                <Clapperboard className="h-3.5 w-3.5" />
                <span className="truncate">{ticket.code}</span>
              </div>
              <h2 className="truncate text-2xl font-black tracking-tight">{ticket.movieTitle}</h2>
            </div>
            <span className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black ${meta.className}`}>
              {meta.label}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <TicketInfo icon={Clock3} label="Suất chiếu" value={formatDateTime(ticket.showtime)} />
            <TicketInfo icon={MapPin} label="Phòng chiếu" value={[ticket.cinemaName, ticket.roomName].filter(Boolean).join(" - ") || "Chưa cập nhật"} />
            <TicketInfo icon={ReceiptText} label="Mã vé" value={ticket.ticketCode || ticket.id} mono />
            <TicketInfo icon={CreditCard} label="Tổng tiền" value={ticket.total ? formatVnd(ticket.total) : "Chưa cập nhật"} highlight />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {ticket.seats.length ? (
                ticket.seats.map((seat) => (
                  <span key={seat} className="rounded-md border border-yellow-400/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-300">
                    {seat}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-500">Ghế chưa cập nhật</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-yellow-400/25 bg-yellow-400/10 px-2 text-xs font-black text-yellow-300">
                7
              </span>
              <span className="text-xs font-bold text-zinc-200">Rating</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TicketDetailModal({ ticket, onClose }: { ticket: MyTicket; onClose: () => void }) {
  const meta = statusMeta(ticket.status);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết vé ${ticket.code}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-white/10 bg-[#181917] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-500">Chi tiết vé</p>
            <h2 className="mt-1 truncate text-xl font-black text-white">{ticket.movieTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative h-72 overflow-hidden bg-zinc-950 md:h-auto">
            {ticket.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ticket.posterUrl} alt={ticket.movieTitle} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-end bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.28),transparent_18rem),linear-gradient(145deg,#101010,#2a2118_54%,#080808)] p-5">
                <Clapperboard className="h-10 w-10 text-yellow-500/80" />
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-widest text-yellow-500">{ticket.code}</p>
                <h3 className="mt-2 text-2xl font-black text-white">{ticket.movieTitle}</h3>
              </div>
              <span className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-black ${meta.className}`}>
                {meta.label}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Booking ID" value={ticket.id} mono />
              <DetailItem label="Mã vé" value={ticket.ticketCode || ticket.code} mono />
              <DetailItem label="Suất chiếu" value={formatDateTime(ticket.showtime)} />
              <DetailItem label="Phòng chiếu" value={[ticket.cinemaName, ticket.roomName].filter(Boolean).join(" - ") || "Chưa cập nhật"} />
              <DetailItem label="Tổng tiền" value={ticket.total ? formatVnd(ticket.total) : "Chưa cập nhật"} highlight />
              <DetailItem label="Ngày đặt" value={formatBookingDate(ticket.createdAt)} />
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Ghế</p>
              <div className="flex flex-wrap gap-2">
                {ticket.seats.length ? (
                  ticket.seats.map((seat) => (
                    <span key={seat} className="rounded-md border border-yellow-400/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-300">
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">Ghế chưa cập nhật</span>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              QR vé đã được gửi qua email của tài khoản đặt vé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 truncate text-sm font-black ${highlight ? "text-yellow-500" : "text-white"} ${mono ? "font-mono" : ""}`}>
        {value || "Chưa cập nhật"}
      </p>
    </div>
  );
}

function TicketInfo({
  icon: Icon,
  label,
  value,
  mono = false,
  highlight = false,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-[#1d1d1c] p-3">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-100/80">
          <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          {label}
        </div>
        <p className={`truncate text-sm font-black ${highlight ? "text-yellow-500" : "text-zinc-100"} ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
