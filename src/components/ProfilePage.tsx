import { useState } from 'react';
import { User, Crown, Star, Ticket, History, Settings, LogOut, ChevronRight, Calendar, MapPin, Clock, Gift } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User as UserType, Booking } from '../types';

interface ProfilePageProps {
  user: UserType;
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onLogout?: () => void;
}

export default function ProfilePage({ user, bookings, onLogout }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const upcomingBookings = bookings.filter((booking) =>
    booking.status === 'pending' || booking.status === 'confirmed'
  );
  const historyBookings = bookings.filter((booking) =>
    booking.status === 'checked_in' ||
    booking.status === 'completed' ||
    booking.status === 'rejected' ||
    booking.status === 'cancelled'
  );

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'VIP': return 'from-yellow-500 to-amber-600';
      case 'Gold': return 'from-yellow-600 to-yellow-700';
      case 'Silver': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-16 lg:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden sticky top-24">
              {/* Profile Header */}
              <div className="p-6 text-center border-b border-white/10">
                <div className="relative inline-block mb-4">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-yellow-500"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${getMembershipColor(user.membershipLevel)} flex items-center justify-center`}>
                    <Crown className="w-4 h-4 text-black" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getMembershipColor(user.membershipLevel)} text-black`}>
                  {user.membershipLevel} Member
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-white">{user.points.toLocaleString()}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Điểm tích lũy</span>
                </div>
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Ticket className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{bookings.length}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Vé đã mua</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3 border-b border-white/10">
                <div className="flex items-center gap-3 text-gray-300">
                  <User className="w-5 h-5 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Ticket className="w-5 h-5 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Gift className="w-5 h-5 text-gray-500" />
                  <span>Tổng chi tiêu: {user.totalSpent.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Menu */}
              <div className="p-4 space-y-1">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span>Cài đặt tài khoản</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5" />
                    <span>Ưu đãi của tôi</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-white mb-6">Vé của tôi</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Ticket className="w-5 h-5" />
                Vé sắp tới ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                <History className="w-5 h-5" />
                Lịch sử ({historyBookings.length})
              </button>
            </div>

            {/* Upcoming Tickets */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <TicketCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <EmptyState type="upcoming" />
                )}
              </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {historyBookings.length > 0 ? (
                  <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Phim</th>
                          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium hidden sm:table-cell">Rạp</th>
                          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Ngày</th>
                          <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyBookings.map(booking => (
                          <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={booking.movie.poster}
                                  alt={booking.movie.title}
                                  className="w-10 h-14 rounded object-cover"
                                />
                                <div>
                                  <p className="text-white font-medium line-clamp-1">{booking.movie.title}</p>
                                  <p className="text-gray-500 text-sm">{booking.seats.map(s => s.id).join(', ')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-400 text-sm hidden sm:table-cell">
                              {booking.cinema.name}
                            </td>
                            <td className="px-4 py-4 text-gray-400 text-sm">
                              {booking.showtime.date}
                            </td>
                            <td className="px-4 py-4 text-right text-yellow-400 font-medium">
                              {booking.totalPrice.toLocaleString()}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState type="history" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden hover:border-yellow-500/50 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="sm:w-32 h-40 sm:h-auto flex-shrink-0">
          <img 
            src={booking.movie.poster}
            alt={booking.movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{booking.movie.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                  {booking.showtime.format}
                </span>
                <span className="px-2 py-1 bg-white/10 text-white text-xs rounded">
                  {booking.movie.rating}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.cinema.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.showtime.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{booking.showtime.time}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {booking.seats.map(seat => (
                  <span 
                    key={seat.id}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded"
                  >
                    {seat.id}
                  </span>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-shrink-0 text-center">
              <div className="p-2 bg-white rounded-lg inline-block">
                <QRCodeSVG 
                  value={booking.qrCode}
                  size={80}
                  level="H"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">{booking.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'upcoming' | 'history' }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
        {type === 'upcoming' ? (
          <Ticket className="w-10 h-10 text-gray-600" />
        ) : (
          <History className="w-10 h-10 text-gray-600" />
        )}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {type === 'upcoming' ? 'Chưa có vé sắp tới' : 'Chưa có lịch sử xem phim'}
      </h3>
      <p className="text-gray-400 text-sm">
        {type === 'upcoming' 
          ? 'Hãy đặt vé để trải nghiệm những bộ phim hay nhất!'
          : 'Lịch sử xem phim của bạn sẽ hiển thị ở đây.'
        }
      </p>
    </div>
  );
}
