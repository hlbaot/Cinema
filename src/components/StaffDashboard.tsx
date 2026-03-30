import { useState, useMemo } from 'react';
import { Booking } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface StaffDashboardProps {
  bookings: Booking[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onCheckInBooking: (bookingId: string) => void;
  onLogout: () => void;
}

const mockShowtimeSchedule = [
  { id: 1, movie: 'DUNE: PART TWO', room: 'Phòng 1 - IMAX', time: '10:30', totalSeats: 120, booked: 85, status: 'active' },
  { id: 2, movie: 'OPPENHEIMER', room: 'Phòng 2 - Gold Class', time: '13:45', totalSeats: 60, booked: 58, status: 'almost-full' },
  { id: 3, movie: 'GODZILLA x KONG', room: 'Phòng 3 - 2D', time: '16:00', totalSeats: 150, booked: 45, status: 'active' },
  { id: 4, movie: 'DUNE: PART TWO', room: 'Phòng 1 - IMAX', time: '19:15', totalSeats: 120, booked: 120, status: 'sold-out' },
  { id: 5, movie: 'OPPENHEIMER', room: 'Phòng 4 - 4DX', time: '21:30', totalSeats: 80, booked: 32, status: 'active' },
];

const mockRevenueData = {
  today: 15680000,
  yesterday: 12450000,
  thisWeek: 89500000,
  thisMonth: 356000000,
  ticketsSold: {
    today: 156,
    thisWeek: 892,
    thisMonth: 3456
  }
};

const mockProducts = [
  { id: 1, name: 'Combo Bắp Nước Lớn', price: 89000, stock: 45, category: 'combo' },
  { id: 2, name: 'Combo Couple', price: 139000, stock: 30, category: 'combo' },
  { id: 3, name: 'Bắp Rang Caramel (L)', price: 55000, stock: 60, category: 'snack' },
  { id: 4, name: 'Coca Cola (L)', price: 35000, stock: 100, category: 'drink' },
  { id: 5, name: 'Nước Suối', price: 15000, stock: 200, category: 'drink' },
];

type TabType = 'dashboard' | 'bookings' | 'pending' | 'showtimes' | 'checkin' | 'products' | 'reports';

export default function StaffDashboard({ 
  bookings, 
  onApproveBooking, 
  onRejectBooking, 
  onCheckInBooking,
  onLogout 
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Stats calculations
  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    checkedIn: bookings.filter(b => b.status === 'checked_in').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    todayRevenue: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'checked_in')
      .reduce((sum, b) => sum + b.totalPrice, 0)
  }), [bookings]);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  const handleScanQR = () => {
    setShowScanModal(true);
    // Simulate QR scan
    setTimeout(() => {
      const confirmedBooking = confirmedBookings[0];
      if (confirmedBooking) {
        setScanResult(confirmedBooking.id);
        setSelectedBooking(confirmedBooking);
      }
    }, 2000);
  };

  const handleConfirmCheckIn = () => {
    if (selectedBooking) {
      onCheckInBooking(selectedBooking.id);
      setShowScanModal(false);
      setScanResult(null);
      setSelectedBooking(null);
    }
  };

  const handleApprove = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowApproveModal(true);
  };

  const handleReject = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const confirmApprove = () => {
    if (selectedBooking) {
      onApproveBooking(selectedBooking.id);
      setShowApproveModal(false);
      setSelectedBooking(null);
    }
  };

  const confirmReject = () => {
    if (selectedBooking && rejectReason) {
      onRejectBooking(selectedBooking.id, rejectReason);
      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectReason('');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchSearch;
    return matchSearch && b.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />Chờ duyệt</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">✓ Đã duyệt</span>;
      case 'checked_in':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">✓ Đã check-in</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">✕ Từ chối</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Staff Header */}
      <header className="bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-white font-bold">CINEPRO</h1>
                  <span className="text-xs text-yellow-500 font-medium">STAFF PORTAL</span>
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-zinc-700"></div>
              <span className="hidden md:block text-zinc-400 text-sm">
                📍 CINEPRO Landmark 81
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Pending Notifications */}
              {stats.pending > 0 && (
                <button 
                  onClick={() => setActiveTab('pending')}
                  className="relative flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  <span className="animate-pulse">🔔</span>
                  <span className="text-sm font-medium">{stats.pending} vé chờ duyệt</span>
                </button>
              )}

              {/* Staff Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">NV</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium">Nhân viên A</p>
                  <p className="text-zinc-500 text-xs">Ca sáng • 06:00 - 14:00</p>
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800 min-h-[calc(100vh-64px)] sticky top-16 hidden lg:block">
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Tổng quan' },
              { id: 'pending', icon: '⏳', label: 'Chờ duyệt', badge: stats.pending },
              { id: 'bookings', icon: '🎫', label: 'Tất cả đơn vé' },
              { id: 'checkin', icon: '✅', label: 'Check-in' },
              { id: 'showtimes', icon: '🎬', label: 'Lịch chiếu' },
              { id: 'products', icon: '🍿', label: 'Sản phẩm' },
              { id: 'reports', icon: '📈', label: 'Báo cáo' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-500 border border-yellow-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Thao tác nhanh</p>
            <button 
              onClick={handleScanQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Quét QR Check-in
            </button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 z-50">
          <div className="flex justify-around py-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Tổng quan' },
              { id: 'pending', icon: '⏳', label: 'Chờ duyệt', badge: stats.pending },
              { id: 'bookings', icon: '🎫', label: 'Đơn vé' },
              { id: 'checkin', icon: '✅', label: 'Check-in' },
              { id: 'reports', icon: '📈', label: 'Báo cáo' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  activeTab === item.id ? 'text-yellow-500' : 'text-zinc-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome & Date */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Xin chào, Nhân viên A! 👋</h2>
                  <p className="text-zinc-400">
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={handleScanQR}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all lg:hidden"
                >
                  <span>📱</span> Quét QR Check-in
                </button>
              </div>

              {/* Pending Alert */}
              {stats.pending > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl animate-bounce">⏳</span>
                    </div>
                    <div>
                      <h3 className="text-orange-400 font-bold">Có {stats.pending} vé đang chờ duyệt!</h3>
                      <p className="text-orange-300/70 text-sm">Vui lòng kiểm tra và xác nhận vé cho khách hàng</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-400 transition-colors"
                  >
                    Duyệt ngay
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setActiveTab('pending')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">⏳</span>
                    <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">Chờ duyệt</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                  <p className="text-zinc-400 text-sm">Vé chờ xử lý</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">✅</span>
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Đã duyệt</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
                  <p className="text-zinc-400 text-sm">Vé đã xác nhận</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">🎫</span>
                    <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">Check-in</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.checkedIn}</p>
                  <p className="text-zinc-400 text-sm">Đã check-in</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">💰</span>
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">Doanh thu</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{(stats.todayRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-zinc-400 text-sm">Từ vé đã duyệt</p>
                </div>
              </div>

              {/* Recent Pending Bookings */}
              {pendingBookings.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>⏳</span> Vé chờ duyệt gần đây
                    </h3>
                    <button 
                      onClick={() => setActiveTab('pending')}
                      className="text-yellow-500 text-sm hover:underline"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {pendingBookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={booking.movie.poster} 
                            alt={booking.movie.title}
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="text-white font-semibold">{booking.movie.title}</h4>
                            <p className="text-zinc-400 text-sm">{booking.customerName} • {booking.seats.map(s => s.id).join(', ')}</p>
                            <p className="text-zinc-500 text-xs">{booking.showtime.date} - {booking.showtime.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleReject(booking)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            Từ chối
                          </button>
                          <button 
                            onClick={() => handleApprove(booking)}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-400 transition-colors"
                          >
                            Duyệt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Showtimes */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🎬</span> Suất chiếu hôm nay
                  </h3>
                  <button 
                    onClick={() => setActiveTab('showtimes')}
                    className="text-yellow-500 text-sm hover:underline"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="grid gap-3">
                  {mockShowtimeSchedule.slice(0, 3).map(show => (
                    <div key={show.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {show.time}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{show.movie}</h4>
                          <p className="text-zinc-400 text-sm">{show.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                show.status === 'sold-out' ? 'bg-red-500' :
                                show.status === 'almost-full' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(show.booked / show.totalSeats) * 100}%` }}
                            />
                          </div>
                          <span className="text-zinc-400 text-sm">{show.booked}/{show.totalSeats}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending Bookings Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>⏳</span> Vé chờ duyệt
                  </h2>
                  <p className="text-zinc-400 mt-1">Kiểm tra và xác nhận vé cho khách hàng</p>
                </div>
                <span className="px-4 py-2 bg-orange-500/20 text-orange-400 font-bold rounded-xl">
                  {pendingBookings.length} vé
                </span>
              </div>

              {pendingBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingBookings.map(booking => (
                    <div key={booking.id} className="bg-zinc-900/50 border border-orange-500/30 rounded-2xl overflow-hidden">
                      <div className="p-4 bg-orange-500/5 border-b border-orange-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xl animate-pulse">⏳</span>
                          </div>
                          <div>
                            <span className="text-orange-400 font-bold">Mã đơn: {booking.id}</span>
                            <p className="text-zinc-400 text-sm">
                              Đặt lúc: {new Date(booking.bookedAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Movie Info */}
                          <div className="flex gap-4 flex-1">
                            <img 
                              src={booking.movie.poster} 
                              alt={booking.movie.title}
                              className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg">{booking.movie.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{booking.showtime.format}</span>
                                <span className="text-zinc-500 text-sm">{booking.movie.duration}</span>
                              </div>
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="text-zinc-400">
                                  <span className="text-zinc-500">Rạp:</span> {booking.cinema.name}
                                </p>
                                <p className="text-zinc-400">
                                  <span className="text-zinc-500">Suất:</span> {booking.showtime.date} - {booking.showtime.time}
                                </p>
                                <p className="text-zinc-400">
                                  <span className="text-zinc-500">Ghế:</span>{' '}
                                  {booking.seats.map(s => (
                                    <span key={s.id} className="inline-block px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded mx-0.5 font-medium">
                                      {s.id}
                                    </span>
                                  ))}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Customer & Payment Info */}
                          <div className="lg:w-72 space-y-3 p-4 bg-zinc-800/50 rounded-xl">
                            <h4 className="text-white font-semibold flex items-center gap-2">
                              <span>👤</span> Thông tin khách hàng
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-zinc-400">
                                <span className="text-zinc-500">Họ tên:</span> {booking.customerName}
                              </p>
                              <p className="text-zinc-400">
                                <span className="text-zinc-500">Email:</span> {booking.customerEmail}
                              </p>
                              <p className="text-zinc-400">
                                <span className="text-zinc-500">SĐT:</span> {booking.customerPhone}
                              </p>
                              <p className="text-zinc-400">
                                <span className="text-zinc-500">Thanh toán:</span>{' '}
                                <span className="text-green-400">{booking.paymentMethod}</span>
                              </p>
                            </div>
                            <div className="pt-3 border-t border-zinc-700">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Tổng tiền:</span>
                                <span className="text-xl font-bold text-yellow-400">{booking.totalPrice.toLocaleString()}đ</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleReject(booking)}
                            className="px-6 py-2.5 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-2"
                          >
                            <span>✕</span> Từ chối
                          </button>
                          <button 
                            onClick={() => handleApprove(booking)}
                            className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-400 transition-colors flex items-center gap-2"
                          >
                            <span>✓</span> Duyệt vé
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Không có vé chờ duyệt</h3>
                  <p className="text-zinc-400">Tất cả vé đã được xử lý</p>
                </div>
              )}
            </div>
          )}

          {/* All Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">🎫 Tất cả đơn đặt vé</h2>
                <div className="flex gap-3">
                  <div className="relative flex-1 md:w-64">
                    <input 
                      type="text"
                      placeholder="Tìm mã đơn, tên, phim..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                    />
                    <svg className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="confirmed">Đã duyệt</option>
                    <option value="checked_in">Đã check-in</option>
                    <option value="rejected">Từ chối</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Mã đơn</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Khách hàng</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Phim</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Suất chiếu</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Ghế</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Tổng</th>
                        <th className="px-4 py-3 text-left text-zinc-400 text-sm font-medium">Trạng thái</th>
                        <th className="px-4 py-3 text-center text-zinc-400 text-sm font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-white font-mono font-medium">{booking.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">{booking.customerName}</p>
                              <p className="text-zinc-500 text-xs">{booking.customerPhone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={booking.movie.poster} alt="" className="w-8 h-12 object-cover rounded" />
                              <span className="text-white text-sm line-clamp-2">{booking.movie.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white">{booking.showtime.time}</p>
                              <p className="text-zinc-500 text-xs">{booking.showtime.date}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {booking.seats.map(s => (
                                <span key={s.id} className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium">
                                  {s.id}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-yellow-400 font-medium">{booking.totalPrice.toLocaleString()}đ</span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {booking.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(booking)}
                                    className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                    title="Duyệt"
                                  >
                                    ✓
                                  </button>
                                  <button 
                                    onClick={() => handleReject(booking)}
                                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    title="Từ chối"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button 
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowScanModal(true);
                                    setScanResult(booking.id);
                                  }}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                                >
                                  Check-in
                                </button>
                              )}
                              {booking.status === 'checked_in' && (
                                <span className="text-blue-400 text-xs">✓ Done</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Check-in Tab */}
          {activeTab === 'checkin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">✅ Check-in khách hàng</h2>

              {/* Scan QR */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Quét mã QR trên vé</h3>
                <p className="text-zinc-400 mb-6">Hướng camera về phía mã QR trên vé điện tử của khách</p>
                <button 
                  onClick={handleScanQR}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all"
                >
                  Bắt đầu quét
                </button>
              </div>

              {/* Manual Search */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Hoặc tìm kiếm thủ công</h3>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="Nhập mã đơn hoặc SĐT khách hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                  />
                  <button className="px-6 py-3 bg-zinc-700 text-white font-medium rounded-xl hover:bg-zinc-600 transition-colors">
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Confirmed Bookings Ready for Check-in */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="text-lg font-bold text-white">Vé sẵn sàng check-in ({confirmedBookings.length})</h3>
                </div>
                <div className="divide-y divide-zinc-800">
                  {confirmedBookings.map(booking => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img 
                          src={booking.movie.poster} 
                          alt={booking.movie.title}
                          className="w-12 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="text-white font-semibold">{booking.customerName}</h4>
                          <p className="text-zinc-400 text-sm">{booking.movie.title}</p>
                          <p className="text-zinc-500 text-xs">{booking.showtime.time} • Ghế: {booking.seats.map(s => s.id).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 font-mono text-sm">{booking.id}</span>
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowScanModal(true);
                            setScanResult(booking.id);
                          }}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-400 transition-colors"
                        >
                          Check-in
                        </button>
                      </div>
                    </div>
                  ))}
                  {confirmedBookings.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                      Không có vé chờ check-in
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Showtimes Tab */}
          {activeTab === 'showtimes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">🎬 Lịch chiếu hôm nay</h2>
              <div className="grid gap-4">
                {mockShowtimeSchedule.map(show => (
                  <div key={show.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold ${
                          show.status === 'sold-out' ? 'bg-red-500/20 text-red-400' :
                          show.status === 'almost-full' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          <span className="text-xl">{show.time}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{show.movie}</h3>
                          <p className="text-zinc-400">{show.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className={`text-sm font-medium ${
                              show.status === 'sold-out' ? 'text-red-400' :
                              show.status === 'almost-full' ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {show.status === 'sold-out' ? 'Hết vé' : 
                               show.status === 'almost-full' ? 'Sắp hết' : 'Còn chỗ'}
                            </p>
                            <p className="text-zinc-500 text-sm">{show.booked}/{show.totalSeats} ghế</p>
                          </div>
                          <div className="w-32 h-3 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                show.status === 'sold-out' ? 'bg-red-500' :
                                show.status === 'almost-full' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(show.booked / show.totalSeats) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">🍿 Quản lý sản phẩm</h2>
                <button className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors">
                  + Thêm sản phẩm
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProducts.map(product => (
                  <div key={product.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-2xl">
                        {product.category === 'combo' ? '🍿' : product.category === 'drink' ? '🥤' : '🍫'}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.stock > 50 ? 'bg-green-500/20 text-green-400' :
                        product.stock > 20 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.stock} còn lại
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                    <p className="text-yellow-400 font-bold">{product.price.toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">📈 Báo cáo doanh thu</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-5">
                  <p className="text-green-400 text-sm font-medium mb-2">Hôm nay</p>
                  <p className="text-3xl font-bold text-white">{(mockRevenueData.today / 1000000).toFixed(1)}M</p>
                  <p className="text-green-400 text-sm mt-1">+12% so với hôm qua</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5">
                  <p className="text-blue-400 text-sm font-medium mb-2">Tuần này</p>
                  <p className="text-3xl font-bold text-white">{(mockRevenueData.thisWeek / 1000000).toFixed(1)}M</p>
                  <p className="text-blue-400 text-sm mt-1">{mockRevenueData.ticketsSold.thisWeek} vé</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-5">
                  <p className="text-purple-400 text-sm font-medium mb-2">Tháng này</p>
                  <p className="text-3xl font-bold text-white">{(mockRevenueData.thisMonth / 1000000).toFixed(0)}M</p>
                  <p className="text-purple-400 text-sm mt-1">{mockRevenueData.ticketsSold.thisMonth} vé</p>
                </div>
              </div>

              {/* Simple Chart */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Doanh thu 7 ngày qua</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                  {[65, 45, 78, 52, 89, 67, 95].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg transition-all hover:from-yellow-400 hover:to-yellow-300"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-zinc-500 text-xs">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-white">Xác nhận duyệt vé?</h3>
              <p className="text-zinc-400 mt-2">
                Vé sẽ được gửi đến khách hàng <span className="text-white font-medium">{selectedBooking.customerName}</span>
              </p>
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <img src={selectedBooking.movie.poster} alt="" className="w-12 h-16 object-cover rounded-lg" />
                <div>
                  <p className="text-white font-medium">{selectedBooking.movie.title}</p>
                  <p className="text-zinc-400 text-sm">{selectedBooking.showtime.date} - {selectedBooking.showtime.time}</p>
                  <p className="text-yellow-400 text-sm font-medium">{selectedBooking.totalPrice.toLocaleString()}đ</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmApprove}
                className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors"
              >
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">✕</span>
              </div>
              <h3 className="text-xl font-bold text-white">Từ chối vé?</h3>
              <p className="text-zinc-400 mt-2">
                Vui lòng nhập lý do từ chối
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-zinc-400 text-sm mb-2">Lý do từ chối *</label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối vé..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none h-24"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-xl mb-6">
              <p className="text-zinc-400 text-sm">Đơn hàng: <span className="text-white">{selectedBooking.id}</span></p>
              <p className="text-zinc-400 text-sm">Khách: <span className="text-white">{selectedBooking.customerName}</span></p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmReject}
                disabled={!rejectReason}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan QR / Check-in Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            {!scanResult ? (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-4 bg-zinc-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-4 border-2 border-yellow-500 rounded-xl"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-500 animate-pulse"></div>
                  <span className="text-6xl animate-pulse">📱</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Đang quét mã QR...</h3>
                <p className="text-zinc-400">Hướng camera về phía mã QR trên vé</p>
                <button 
                  onClick={() => setShowScanModal(false)}
                  className="mt-6 px-6 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : selectedBooking ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Vé hợp lệ!</h3>
                  <p className="text-green-400">Mã: {selectedBooking.id}</p>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-xl mb-4">
                  <div className="flex items-center gap-4">
                    <img src={selectedBooking.movie.poster} alt="" className="w-16 h-24 object-cover rounded-lg" />
                    <div>
                      <h4 className="text-white font-bold">{selectedBooking.movie.title}</h4>
                      <p className="text-zinc-400 text-sm">{selectedBooking.customerName}</p>
                      <p className="text-zinc-500 text-sm">{selectedBooking.showtime.date} - {selectedBooking.showtime.time}</p>
                      <div className="flex gap-1 mt-2">
                        {selectedBooking.seats.map(s => (
                          <span key={s.id} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium">
                            {s.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="text-center mb-4 p-4 bg-white rounded-xl">
                  <QRCodeSVG value={selectedBooking.qrCode} size={120} level="H" />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowScanModal(false);
                      setScanResult(null);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Đóng
                  </button>
                  {selectedBooking.status === 'confirmed' && (
                    <button 
                      onClick={handleConfirmCheckIn}
                      className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors"
                    >
                      Xác nhận Check-in
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
