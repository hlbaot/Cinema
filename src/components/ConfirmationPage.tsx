import { Check, Download, Share2, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Movie, Showtime, Cinema, Seat } from '../types';

interface ConfirmationPageProps {
  movie: Movie;
  showtime: Showtime;
  cinema: Cinema;
  selectedSeats: Seat[];
  paymentMethod: string;
  bookingId: string;
  onGoHome: () => void;
  onViewBookings: () => void;
}

export default function ConfirmationPage({
  movie,
  showtime,
  cinema,
  selectedSeats,
  paymentMethod,
  bookingId,
  onGoHome,
  onViewBookings
}: ConfirmationPageProps) {
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0) + 10000;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-16 lg:pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-500/30 rounded-full mx-auto animate-ping" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Đặt vé thành công!</h1>
          <p className="text-gray-400">Mã đặt vé của bạn: <span className="text-yellow-400 font-mono font-bold">{bookingId}</span></p>
        </div>

        {/* Ticket Card */}
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">CINEPRO</span>
              </div>
              <span className="text-white/80 text-sm">E-Ticket</span>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-4">
              <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{movie.title}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                    {showtime.format}
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-white text-xs rounded">
                    {movie.rating}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{cinema.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{showtime.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{showtime.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-white/20" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 rounded-full" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 rounded-full" />
          </div>

          {/* Seats & QR */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h4 className="text-gray-500 text-sm mb-2">GHẾ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(seat => (
                    <span 
                      key={seat.id}
                      className="px-3 py-2 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg"
                    >
                      {seat.id}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Số lượng</span>
                    <span className="text-white font-medium">{selectedSeats.length} vé</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Thanh toán</span>
                    <span className="text-white font-medium capitalize">
                      {paymentMethod === 'card' ? 'Thẻ tín dụng' : paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-gray-500 text-sm block">Tổng tiền</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex-shrink-0 text-center">
                <div className="p-3 bg-white rounded-xl">
                  <QRCodeSVG 
                    value={`CINEPRO-${bookingId}-${selectedSeats.map(s => s.id).join('-')}`}
                    size={120}
                    level="H"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">Quét mã khi vào rạp</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-black/30 border-t border-white/10">
            <p className="text-gray-500 text-xs text-center">
              Vui lòng đến trước giờ chiếu 15 phút. Xuất trình mã QR hoặc mã đặt vé tại quầy để nhận vé.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            <Download className="w-5 h-5" />
            Tải vé
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
            Chia sẻ
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onViewBookings}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all"
          >
            Xem vé của tôi
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 py-4 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
