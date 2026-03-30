import { useState } from 'react';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Mock data for admin
const mockStats = {
  totalRevenue: 2547890000,
  totalTickets: 15234,
  totalUsers: 8542,
  totalMovies: 24,
  pendingBookings: 12,
  todayRevenue: 125670000,
  todayTickets: 856
};

const mockMoviesData = [
  { id: 1, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', status: 'showing', revenue: 456780000, tickets: 2341, rating: 8.8 },
  { id: 2, title: 'Kung Fu Panda 4', poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', status: 'showing', revenue: 389560000, tickets: 2156, rating: 7.5 },
  { id: 3, title: 'Godzilla x Kong', poster: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg', status: 'showing', revenue: 345230000, tickets: 1987, rating: 7.8 },
  { id: 4, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', status: 'showing', revenue: 298450000, tickets: 1654, rating: 8.9 },
  { id: 5, title: 'Wonka', poster: 'https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', status: 'coming', revenue: 0, tickets: 0, rating: 7.2 },
];

const mockCinemasData = [
  { id: 1, name: 'CINEPRO Landmark 81', address: 'Tầng 3, TTTM Landmark 81, Q. Bình Thạnh', rooms: 8, totalSeats: 1200, status: 'active' },
  { id: 2, name: 'CINEPRO Nguyễn Du', address: '116 Nguyễn Du, Q.1, TP.HCM', rooms: 6, totalSeats: 850, status: 'active' },
  { id: 3, name: 'CINEPRO Gò Vấp', address: '242 Nguyễn Văn Lượng, Gò Vấp', rooms: 5, totalSeats: 720, status: 'active' },
];

const mockUsersData = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', role: 'customer' as const, memberTier: 'vip' as const, points: 15000, status: 'active', joinDate: '2023-01-15' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0912345678', role: 'customer' as const, memberTier: 'gold' as const, points: 8500, status: 'active', joinDate: '2023-03-20' },
  { id: 3, name: 'Lê Văn Cường', email: 'cuong.staff@cinepro.vn', phone: '0923456789', role: 'staff' as const, memberTier: 'silver' as const, points: 0, status: 'active', joinDate: '2023-02-10' },
  { id: 4, name: 'Phạm Thị Dung', email: 'dung.admin@cinepro.vn', phone: '0934567890', role: 'admin' as const, memberTier: 'vip' as const, points: 0, status: 'active', joinDate: '2022-06-01' },
];

type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled';

interface AdminBooking {
  id: string;
  customer: string;
  movie: string;
  cinema: string;
  showtime: string;
  date: string;
  seats: string[];
  total: number;
  status: BookingStatus;
  createdAt: string;
}

const mockBookingsData: AdminBooking[] = [
  { id: 'BK001', customer: 'Nguyễn Văn An', movie: 'Dune: Part Two', cinema: 'CINEPRO Landmark 81', showtime: '19:30', date: '2024-03-15', seats: ['D5', 'D6'], total: 360000, status: 'pending', createdAt: '2024-03-14T10:30:00' },
  { id: 'BK002', customer: 'Trần Thị Bình', movie: 'Kung Fu Panda 4', cinema: 'CINEPRO Nguyễn Du', showtime: '14:00', date: '2024-03-15', seats: ['E7', 'E8', 'E9'], total: 450000, status: 'confirmed', createdAt: '2024-03-14T11:45:00' },
  { id: 'BK003', customer: 'Hoàng Văn Em', movie: 'Godzilla x Kong', cinema: 'CINEPRO Gò Vấp', showtime: '21:00', date: '2024-03-15', seats: ['F10'], total: 150000, status: 'pending', createdAt: '2024-03-14T14:20:00' },
];

type TabType = 'dashboard' | 'movies' | 'cinemas' | 'showtimes' | 'users' | 'bookings' | 'reports' | 'settings';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [movies, setMovies] = useState(mockMoviesData);
  const [cinemas, setCinemas] = useState(mockCinemasData);
  const [users, setUsers] = useState(mockUsersData);
  const [bookings, setBookings] = useState(mockBookingsData);
  
  // Modal states
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'movies', label: 'Quản lý Phim', icon: '🎬' },
    { id: 'cinemas', label: 'Quản lý Rạp', icon: '🏢' },
    { id: 'showtimes', label: 'Lịch chiếu', icon: '📅' },
    { id: 'users', label: 'Người dùng', icon: '👥' },
    { id: 'bookings', label: 'Đơn đặt vé', icon: '🎫' },
    { id: 'reports', label: 'Báo cáo', icon: '📈' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  // Dashboard Overview
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(mockStats.totalRevenue)}</p>
              <p className="text-green-300 text-sm mt-2">↑ 12.5% so với tháng trước</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Vé đã bán</p>
              <p className="text-2xl font-bold text-white mt-1">{formatNumber(mockStats.totalTickets)}</p>
              <p className="text-green-300 text-sm mt-2">↑ 8.3% so với tháng trước</p>
            </div>
            <div className="text-4xl opacity-80">🎫</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Người dùng</p>
              <p className="text-2xl font-bold text-white mt-1">{formatNumber(mockStats.totalUsers)}</p>
              <p className="text-green-300 text-sm mt-2">↑ 15.2% so với tháng trước</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Chờ duyệt</p>
              <p className="text-2xl font-bold text-white mt-1">{mockStats.pendingBookings}</p>
              <p className="text-yellow-300 text-sm mt-2">Cần xử lý ngay</p>
            </div>
            <div className="text-4xl opacity-80">⏳</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Doanh thu 7 ngày qua</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 45, 78, 52, 89, 67, 94].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-500 hover:to-purple-300"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movies */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Top phim doanh thu</h3>
          <div className="space-y-4">
            {movies.filter(m => m.status === 'showing').slice(0, 5).map((movie, index) => (
              <div key={movie.id} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-600 w-8">#{index + 1}</span>
                <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-medium">{movie.title}</p>
                  <p className="text-sm text-gray-400">{formatCurrency(movie.revenue)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-500">{formatNumber(movie.tickets)}</p>
                  <p className="text-xs text-gray-400">vé</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Đơn đặt vé gần đây</h3>
          <button 
            onClick={() => setActiveTab('bookings')}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Xem tất cả →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="pb-3 font-medium">Mã đơn</th>
                <th className="pb-3 font-medium">Khách hàng</th>
                <th className="pb-3 font-medium">Phim</th>
                <th className="pb-3 font-medium">Rạp</th>
                <th className="pb-3 font-medium">Tổng tiền</th>
                <th className="pb-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-800/50">
                  <td className="py-3 font-mono text-purple-400">{booking.id}</td>
                  <td className="py-3">{booking.customer}</td>
                  <td className="py-3">{booking.movie}</td>
                  <td className="py-3 text-gray-400">{booking.cinema}</td>
                  <td className="py-3 font-medium">{formatCurrency(booking.total)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {booking.status === 'confirmed' ? 'Đã xác nhận' :
                       booking.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Movies Management
  const renderMovies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Phim</h2>
        <button 
          onClick={() => { setEditingItem(null); setShowMovieModal(true); }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <span>➕</span> Thêm phim mới
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Tìm kiếm phim..." 
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
          <option value="">Tất cả trạng thái</option>
          <option value="showing">Đang chiếu</option>
          <option value="coming">Sắp chiếu</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-gray-900/50 backdrop-blur rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition group">
            <div className="relative">
              <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  movie.status === 'showing' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {movie.status === 'showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button 
                  onClick={() => { setEditingItem(movie); setShowMovieModal(true); }}
                  className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa phim này?')) {
                      setMovies(prev => prev.filter(m => m.id !== movie.id));
                    }
                  }}
                  className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>⭐ {movie.rating}</span>
                <span>🎫 {formatNumber(movie.tickets)} vé</span>
              </div>
              <p className="text-purple-400 font-medium mt-2">{formatCurrency(movie.revenue)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Sửa phim' : 'Thêm phim mới'}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tên phim</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.title || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Nhập tên phim"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.poster || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="URL hình ảnh poster"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Trạng thái</label>
                  <select 
                    defaultValue={editingItem?.status || 'showing'}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="showing">Đang chiếu</option>
                    <option value="coming">Sắp chiếu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Đánh giá</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="10"
                    defaultValue={editingItem?.rating || ''}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="0-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowMovieModal(false);
                    // Add/update movie logic here
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
                >
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Cinemas Management
  const renderCinemas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Rạp</h2>
        <button 
          onClick={() => { setEditingItem(null); setShowCinemaModal(true); }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <span>➕</span> Thêm rạp mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cinemas.map((cinema) => (
          <div key={cinema.id} className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl">
                🏢
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingItem(cinema); setShowCinemaModal(true); }}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa rạp này?')) {
                      setCinemas(prev => prev.filter(c => c.id !== cinema.id));
                    }
                  }}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-red-600 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">{cinema.name}</h3>
            <p className="text-gray-400 text-sm mb-4">📍 {cinema.address}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                {cinema.rooms} phòng
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                {formatNumber(cinema.totalSeats)} ghế
              </span>
              <span className={`px-3 py-1 rounded-full ${
                cinema.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {cinema.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cinema Modal */}
      {showCinemaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Sửa rạp' : 'Thêm rạp mới'}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tên rạp</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Nhập tên rạp"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Địa chỉ</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.address || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Số phòng</label>
                  <input 
                    type="number" 
                    defaultValue={editingItem?.rooms || ''}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tổng số ghế</label>
                  <input 
                    type="number" 
                    defaultValue={editingItem?.totalSeats || ''}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCinemaModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCinemaModal(false)}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
                >
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Showtimes Management
  const renderShowtimes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Lịch chiếu</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
          <span>➕</span> Thêm suất chiếu
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500" />
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
          <option value="">Tất cả rạp</option>
          {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
          <option value="">Tất cả phim</option>
          {movies.filter(m => m.status === 'showing').map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm bg-gray-800/50">
              <th className="px-4 py-3 font-medium">Phim</th>
              <th className="px-4 py-3 font-medium">Rạp</th>
              <th className="px-4 py-3 font-medium">Phòng</th>
              <th className="px-4 py-3 font-medium">Giờ chiếu</th>
              <th className="px-4 py-3 font-medium">Định dạng</th>
              <th className="px-4 py-3 font-medium">Ghế trống</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {[
              { movie: 'Dune: Part Two', cinema: 'CINEPRO Landmark 81', room: 'IMAX 1', time: '10:00', format: 'IMAX', available: 45, total: 120 },
              { movie: 'Kung Fu Panda 4', cinema: 'CINEPRO Landmark 81', room: 'Phòng 3', time: '12:30', format: '2D', available: 80, total: 150 },
              { movie: 'Godzilla x Kong', cinema: 'CINEPRO Nguyễn Du', room: 'Gold Class', time: '14:00', format: 'Gold Class', available: 12, total: 40 },
              { movie: 'Dune: Part Two', cinema: 'CINEPRO Landmark 81', room: 'IMAX 1', time: '16:30', format: 'IMAX', available: 0, total: 120 },
              { movie: 'Oppenheimer', cinema: 'CINEPRO Gò Vấp', room: 'Phòng 1', time: '19:00', format: '2D', available: 65, total: 100 },
            ].map((showtime, index) => (
              <tr key={index} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium">{showtime.movie}</td>
                <td className="px-4 py-3 text-gray-400">{showtime.cinema}</td>
                <td className="px-4 py-3">{showtime.room}</td>
                <td className="px-4 py-3 font-mono text-yellow-500">{showtime.time}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    showtime.format === 'IMAX' ? 'bg-blue-500/20 text-blue-400' :
                    showtime.format === 'Gold Class' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {showtime.format}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          showtime.available === 0 ? 'bg-red-500' :
                          showtime.available / showtime.total < 0.3 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(showtime.available / showtime.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{showtime.available}/{showtime.total}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded">✏️</button>
                    <button className="p-1 hover:bg-red-600 rounded">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Users Management
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
        <button 
          onClick={() => { setEditingItem(null); setShowUserModal(true); }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <span>➕</span> Thêm người dùng
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Tìm theo tên, email, SĐT..." 
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
          <option value="">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm bg-gray-800/50">
              <th className="px-4 py-3 font-medium">Người dùng</th>
              <th className="px-4 py-3 font-medium">Liên hệ</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Hạng TV</th>
              <th className="px-4 py-3 font-medium">Điểm</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                    user.role === 'staff' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'Khách hàng'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.memberTier === 'vip' ? 'bg-yellow-500/20 text-yellow-400' :
                    user.memberTier === 'gold' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.memberTier.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-yellow-500">{formatNumber(user.points)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingItem(user); setShowUserModal(true); }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        setUsers(prev => prev.map(u => 
                          u.id === user.id ? { ...u, status: u.status === 'active' ? 'locked' : 'active' } : u
                        ));
                      }}
                      className="p-1 hover:bg-yellow-600 rounded"
                    >
                      {user.status === 'active' ? '🔒' : '🔓'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
                <input 
                  type="text" 
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue={editingItem?.email || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  defaultValue={editingItem?.phone || ''}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vai trò</label>
                <select 
                  defaultValue={editingItem?.role || 'customer'}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
                >
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Bookings Management
  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Đơn đặt vé</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
            {bookings.filter(b => b.status === 'pending').length} chờ duyệt
          </span>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Tìm theo mã đơn, tên khách hàng, phim..." 
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="checked_in">Đã check-in</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm bg-gray-800/50">
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Phim</th>
              <th className="px-4 py-3 font-medium">Suất chiếu</th>
              <th className="px-4 py-3 font-medium">Ghế</th>
              <th className="px-4 py-3 font-medium">Tổng tiền</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {bookings.map((booking) => (
              <tr key={booking.id} className={`hover:bg-gray-800/50 ${booking.status === 'pending' ? 'bg-yellow-500/5' : ''}`}>
                <td className="px-4 py-3 font-mono text-purple-400">{booking.id}</td>
                <td className="px-4 py-3">{booking.customer}</td>
                <td className="px-4 py-3 font-medium">{booking.movie}</td>
                <td className="px-4 py-3">
                  <p className="text-sm">{booking.date}</p>
                  <p className="text-xs text-gray-400">{booking.showtime} - {booking.cinema}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {booking.seats.map((seat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs">{seat}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-yellow-500">{formatCurrency(booking.total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    booking.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' :
                     booking.status === 'pending' ? 'Chờ duyệt' :
                     booking.status === 'checked_in' ? 'Đã check-in' : 'Đã hủy'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => {
                            setBookings(prev => prev.map(b => 
                              b.id === booking.id ? { ...b, status: 'confirmed' as const } : b
                            ));
                          }}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-xs transition"
                        >
                          ✓ Duyệt
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn từ chối đơn này?')) {
                              setBookings(prev => prev.map(b => 
                                b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
                              ));
                            }
                          }}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs transition"
                        >
                          ✕ Từ chối
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => {
                          setBookings(prev => prev.map(b => 
                            b.id === booking.id ? { ...b, status: 'checked_in' as const } : b
                          ));
                        }}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs transition"
                      >
                        📱 Check-in
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Reports
  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Báo cáo & Thống kê</h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
            <option value="365">1 năm qua</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition">
            📥 Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Tổng doanh thu</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(mockStats.totalRevenue)}</p>
          <p className="text-green-400 text-sm mt-2">↑ 12.5% so với kỳ trước</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Tổng vé bán ra</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{formatNumber(mockStats.totalTickets)}</p>
          <p className="text-green-400 text-sm mt-2">↑ 8.3% so với kỳ trước</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Người dùng mới</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">1,234</p>
          <p className="text-green-400 text-sm mt-2">↑ 15.2% so với kỳ trước</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo ngày</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
                <span className="text-xs text-gray-500">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Top phim doanh thu</h3>
          <div className="space-y-4">
            {movies.filter(m => m.status === 'showing').slice(0, 5).map((movie) => (
              <div key={movie.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{movie.title}</span>
                  <span className="text-sm text-purple-400">{formatCurrency(movie.revenue)}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                    style={{ width: `${(movie.revenue / movies[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Cinema */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Doanh thu theo rạp</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cinemas.map((cinema, idx) => {
            const revenue = [856000000, 654000000, 432000000][idx];
            return (
              <div key={cinema.id} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    🏢
                  </div>
                  <div>
                    <p className="font-medium">{cinema.name}</p>
                    <p className="text-xs text-gray-400">{cinema.rooms} phòng</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-500">{formatCurrency(revenue)}</p>
                <p className="text-sm text-gray-400 mt-1">{formatNumber(Math.floor(revenue / 180000))} vé</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Settings
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🏢</span> Thông tin rạp
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tên hệ thống</label>
              <input 
                type="text" 
                defaultValue="CINEPRO"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hotline</label>
              <input 
                type="text" 
                defaultValue="1900 1234"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email hỗ trợ</label>
              <input 
                type="email" 
                defaultValue="support@cinepro.vn"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎫</span> Cấu hình đặt vé
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Thời gian giữ ghế (phút)</label>
              <input 
                type="number" 
                defaultValue="10"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Số vé tối đa mỗi đơn</label>
              <input 
                type="number" 
                defaultValue="8"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cho phép hủy vé</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">💳</span> Phương thức thanh toán
          </h3>
          <div className="space-y-3">
            {['Thẻ tín dụng/ghi nợ', 'MoMo', 'ZaloPay', 'VNPay', 'ShopeePay'].map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span>{method}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🔔</span> Cấu hình thông báo
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Email xác nhận đặt vé', checked: true },
              { label: 'SMS nhắc nhở trước suất chiếu', checked: true },
              { label: 'Push notification', checked: false },
              { label: 'Email khuyến mãi', checked: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span>{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition">
          💾 Lưu cài đặt
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'movies': return renderMovies();
      case 'cinemas': return renderCinemas();
      case 'showtimes': return renderShowtimes();
      case 'users': return renderUsers();
      case 'bookings': return renderBookings();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900/80 backdrop-blur border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-bold text-xl">
              🎬
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CINEPRO
                </h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30' 
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
              {tab.id === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-sm text-gray-400">Chào mừng trở lại, Admin!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                🔔
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-gray-400">admin@cinepro.vn</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
