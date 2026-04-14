import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Upload, 
  Film, Tag, Link2, Calendar, Clock,
  TrendingUp, Users, Ticket, CheckCircle2,
  AlertCircle, ChevronRight, LayoutDashboard,
  Building2, UserCircle, Receipt, BarChart3,
  Settings as SettingsIcon, LogOut, Play,
  Type, Info, Save, ShieldAlert, User
} from 'lucide-react';

export enum MovieAgeRating {
  P = 'p',
  K = 'k',
  T13 = '13 tuổi',
  T16 = '16 tuổi',
  T18 = '18 tuổi',
}

interface Genre {
  id: string;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  poster: string;
  status: 'showing' | 'coming';
  revenue: number;
  tickets: number;
  ageRating: MovieAgeRating;
  genre: string;
  trailer: string;
  releaseDate: string;
  endDate: string;
  duration: number;
  director: string;
  actors: string;
}

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState(mockCinemasData);
  const [users, setUsers] = useState(mockUsersData);
  const [bookings, setBookings] = useState(mockBookingsData);
  
  // Modal states
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Genres
        const genreRes = await fetch('http://10.36.120.153:5050/api/v1/movies/genre/all');
        const genreResult = await genreRes.json();
        const genreData = Array.isArray(genreResult)
          ? genreResult
          : Array.isArray(genreResult?.data)
            ? genreResult.data
            : [];
        setAvailableGenres(genreData);

        // Fetch Movies
        const movieRes = await fetch('http://10.36.120.153:5050/api/v1/movies/all');
        const movieResult = await movieRes.json();
        const movieData = Array.isArray(movieResult)
          ? movieResult
          : Array.isArray(movieResult?.data)
            ? movieResult.data
            : [];

        const mapToAgeRating = (rating: string): MovieAgeRating => {
          if (!rating) return MovieAgeRating.P;
          const r = rating.toLowerCase();
          if (r === 'p') return MovieAgeRating.P;
          if (r === 'k') return MovieAgeRating.K;
          if (r.includes('13')) return MovieAgeRating.T13;
          if (r.includes('16')) return MovieAgeRating.T16;
          if (r.includes('18')) return MovieAgeRating.T18;
          return MovieAgeRating.P;
        };

        const mappedMovies = movieData.map((m: any) => ({
          id: m.id,
          title: m.title,
          poster: m.poster || m.image || 'https://via.placeholder.com/400x600?text=No+Poster',
          status: new Date(m.releaseDate) <= new Date() ? 'showing' : 'coming',
          revenue: m.revenue || 0,
          tickets: m.tickets || 0,
          ageRating: mapToAgeRating(m.rating),
          genre: Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || ''),
          trailer: m.trailer || '',
          releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : '',
          endDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : (m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : ''),
          duration: parseInt(m.duration) || 120,
          director: m.director || '',
          actors: Array.isArray(m.actors) ? m.actors.map((a: any) => a.name || a).join(', ') : (m.actors || '')
        }));
        setMovies(mappedMovies);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'movies', label: 'Quản lý Phim', icon: <Film className="w-5 h-5" /> },
    { id: 'cinemas', label: 'Quản lý Rạp', icon: <Building2 className="w-5 h-5" /> },
    { id: 'showtimes', label: 'Lịch chiếu', icon: <Calendar className="w-5 h-5" /> },
    { id: 'users', label: 'Người dùng', icon: <UserCircle className="w-5 h-5" /> },
    { id: 'bookings', label: 'Đơn đặt vé', icon: <Ticket className="w-5 h-5" /> },
    { id: 'reports', label: 'Báo cáo', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Cài đặt', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  // Dashboard Overview
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(mockStats.totalRevenue)}</p>
              <div className="flex items-center gap-1 text-green-300 text-sm mt-2">
                <TrendingUp className="w-3 h-3" />
                <span>8.3% so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Vé đã bán</p>
              <p className="text-2xl font-bold text-white mt-1">{formatNumber(mockStats.totalTickets)}</p>
              <div className="flex items-center gap-1 text-green-300 text-sm mt-2">
                <TrendingUp className="w-3 h-3" />
                <span>8.3% so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Người dùng</p>
              <p className="text-2xl font-bold text-white mt-1">{formatNumber(mockStats.totalUsers)}</p>
              <div className="flex items-center gap-1 text-green-300 text-sm mt-2">
                <TrendingUp className="w-3 h-3" />
                <span>15.2% so với tháng trước</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Chờ duyệt</p>
              <p className="text-2xl font-bold text-white mt-1">{mockStats.pendingBookings}</p>
              <div className="flex items-center gap-1 text-yellow-300 text-sm mt-2">
                <AlertCircle className="w-3 h-3" />
                <span>Cần xử lý ngay</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
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
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Thêm phim mới
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Tìm kiếm phim..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
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
                  className="p-2 bg-blue-500/80 backdrop-blur rounded-lg hover:bg-blue-600 transition shadow-lg"
                  title="Sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa phim này?')) {
                      setMovies(prev => prev.filter(m => m.id !== movie.id));
                    }
                  }}
                  className="p-2 bg-red-500/80 backdrop-blur rounded-lg hover:bg-red-600 transition shadow-lg"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  movie.ageRating === MovieAgeRating.P ? 'text-green-500 border-green-500/50 bg-green-500/10' :
                  movie.ageRating === MovieAgeRating.K ? 'text-blue-500 border-blue-500/50 bg-blue-500/10' :
                  movie.ageRating === MovieAgeRating.T13 ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' :
                  movie.ageRating === MovieAgeRating.T16 ? 'text-orange-500 border-orange-500/50 bg-orange-500/10' :
                  'text-red-500 border-red-500/50 bg-red-500/10'
                }`}>
                  {movie.ageRating === MovieAgeRating.P ? 'P' :
                   movie.ageRating === MovieAgeRating.K ? 'K' :
                   movie.ageRating === MovieAgeRating.T13 ? 'T13' :
                   movie.ageRating === MovieAgeRating.T16 ? 'T16' : 'T18'}
                </span>
                <span>🎫 {formatNumber(movie.tickets)} vé</span>
              </div>
              <p className="text-purple-400 font-medium mt-2">{formatCurrency(movie.revenue)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{editingItem ? 'Hiệu chỉnh Phim' : 'Thêm Phim Mới'}</h3>
                  <p className="text-xs text-gray-400">Vui lòng điền đầy đủ thông tin phim bên dưới</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMovieModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Poster Preview */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="relative group">
                    <div className="aspect-[2/3] w-full bg-gray-800 rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 group-hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center text-center p-4">
                      {editingItem?.poster ? (
                        <>
                          <img src={editingItem.poster} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium border border-white/30">Thay đổi ảnh</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-300">Tải lên Poster</p>
                          <p className="text-xs text-gray-500 mt-2">Dạng ảnh .jpg, .png (Tỷ lệ 2:3)</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Độ tuổi được xem</label>
                      <div className="relative">
                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <select 
                          defaultValue={editingItem?.ageRating || MovieAgeRating.P}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white appearance-none"
                        >
                          <option value={MovieAgeRating.P}>P - Phổ biến</option>
                          <option value={MovieAgeRating.K}>K - Cần phụ huynh (dưới 13)</option>
                          <option value={MovieAgeRating.T13}>T13 - Cấm dưới 13 tuổi</option>
                          <option value={MovieAgeRating.T16}>T16 - Cấm dưới 16 tuổi</option>
                          <option value={MovieAgeRating.T18}>T18 - Cấm dưới 18 tuổi</option>
                        </select>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Thời lượng (phút)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input 
                          type="number"
                          defaultValue={editingItem?.duration || ''}
                          placeholder="120"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Main Info */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Tên phim</label>
                      <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input 
                          type="text" 
                          defaultValue={editingItem?.title || ''}
                          placeholder="Nhập tên phim chính xác"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white font-medium italic"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Thể loại</label>
                      <div className="relative group/genres">
                        <Tag className="absolute left-3 top-3 w-4 h-4 text-pink-400" />
                        <div className="min-h-[46px] pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                          <div className="flex flex-wrap gap-2">
                            {editingItem?.genre?.split(', ').filter(Boolean).map((g: string) => (
                              <span key={g} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md text-xs border border-purple-500/30 flex items-center gap-1">
                                {g}
                                <button 
                                  type="button" 
                                  className="hover:text-white ml-1 font-bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newGenres = editingItem.genre.split(', ').filter((genre: string) => genre !== g);
                                    setEditingItem({ ...editingItem, genre: newGenres.join(', ') });
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {(!editingItem?.genre || editingItem.genre === '') && <span className="text-gray-500 text-sm mt-1">Chọn thể loại...</span>}
                          </div>
                        </div>
                        
                        {/* Custom Dropdown for multi-select */}
                        <div className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto hidden group-focus-within/genres:block hover:block">
                          <div className="p-2 grid grid-cols-2 gap-1">
                            {availableGenres.map((genre) => {
                              const isSelected = editingItem?.genre?.split(', ').includes(genre.name);
                              return (
                                <button
                                  key={genre.id}
                                  type="button"
                                  onClick={() => {
                                    const currentGenres = editingItem?.genre?.split(', ').filter(Boolean) || [];
                                    let newGenres;
                                    if (isSelected) {
                                      newGenres = currentGenres.filter((g: string) => g !== genre.name);
                                    } else {
                                      newGenres = [...currentGenres, genre.name];
                                    }
                                    setEditingItem({ ...editingItem, genre: newGenres.join(', ') });
                                  }}
                                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'hover:bg-gray-800 text-gray-400'
                                  }`}
                                >
                                  {genre.name}
                                  {isSelected && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Trạng thái</label>
                      <div className="relative">
                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <select 
                          defaultValue={editingItem?.status || 'showing'}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white appearance-none"
                        >
                          <option value="showing">🎬 Đang chiếu</option>
                          <option value="coming">⏳ Sắp chiếu</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Đạo diễn</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                        <input 
                          type="text" 
                          defaultValue={editingItem?.director || ''}
                          placeholder="Tên đạo diễn"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Diễn viên</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input 
                          type="text" 
                          defaultValue={editingItem?.actors || ''}
                          placeholder="Tên các diễn viên (cách nhau bởi dấu phẩy)"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Link Trailer (YouTube)</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        <input 
                          type="url" 
                          defaultValue={editingItem?.trailer || ''}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white text-sm"
                        />
                        {editingItem?.trailer && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Play className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Link Poster Image</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input 
                          type="text" 
                          defaultValue={editingItem?.poster || ''}
                          placeholder="URL hình ảnh poster"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Ngày công chiếu</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                        <input 
                          type="date" 
                          defaultValue={editingItem?.releaseDate || ''}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Ngày kết thúc</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                        <input 
                          type="date" 
                          defaultValue={editingItem?.endDate || ''}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-end gap-4 sticky bottom-0">
              <button 
                type="button"
                onClick={() => setShowMovieModal(false)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowMovieModal(false);
                  // Logic to add/update would go here
                }}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Cập nhật Phim' : 'Thêm Phim Mới'}
              </button>
            </div>
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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, tên khách hàng, phim..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
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
                <td className="px-4 py-3 font-mono text-purple-400 flex items-center gap-2">
                  <Receipt className="w-3 h-3 text-purple-500" />
                  {booking.id}
                </td>
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
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    booking.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
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

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isSidebarExpanded = sidebarOpen || mobileSidebarOpen;

  return (
    <div className="min-h-screen bg-black text-white">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarOpen ? 'md:w-64' : 'md:w-20'} fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/50 backdrop-blur border-r border-gray-800 transition-all duration-300 flex flex-col md:sticky md:top-0 md:h-screen md:translate-x-0`}
        >
          <div className="p-4 border-b border-gray-800">
            <div
              className={`flex items-center ${isSidebarExpanded ? 'gap-3 justify-start' : 'justify-center'} cursor-pointer`}
              onClick={() => {
                setActiveTab('dashboard');
                setMobileSidebarOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                🎬
              </div>
              {isSidebarExpanded && (
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    CINEPRO
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/5' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-500'}`}>
                  {tab.icon}
                </span>
                {isSidebarExpanded && <span className="font-medium text-sm">{tab.label}</span>}
                {tab.id === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className={`ml-auto bg-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSidebarExpanded ? '' : 'absolute top-2 right-2'}`}>
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-4 border-t border-gray-800">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-800/50 px-3 py-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white md:flex"
            >
              <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}>
                <ChevronRight className="w-4 h-4" />
              </div>
              {sidebarOpen && <span className="text-xs font-medium">Thu gọn</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col bg-black">
          {/* Top Header */}
          <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-gray-700 hover:text-white md:hidden"
                  aria-label="Mở menu"
                >
                  <ChevronRight className={`h-5 w-5 transition-transform ${mobileSidebarOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white uppercase tracking-tight">{activeTabConfig.label}</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase">Dashboard</span>
                    <span className="text-[10px] text-gray-600">/</span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase">{activeTabConfig.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <button className="relative p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-black">
                    3
                  </span>
                </button>
                <div className="h-8 w-px bg-gray-800 hidden md:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold border border-white/10">
                    A
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium text-sm">Admin User</p>
                    <p className="text-[10px] text-gray-500">admin@cinepro.vn</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {/* Breadcrumbs / Page Header */}
            <div className="px-4 py-4 md:px-8 bg-gray-900/20 border-b border-gray-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{activeTabConfig.label}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500 uppercase">Dashboard</span>
                  <span className="text-[10px] text-gray-600">/</span>
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{activeTabConfig.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Hôm nay, {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="p-4 md:p-8 custom-scrollbar">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
