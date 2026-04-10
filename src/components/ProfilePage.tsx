import { useState } from 'react';
import { User, Crown, Star, Ticket, History, Settings, LogOut, ChevronRight, Calendar, MapPin, Clock, Gift, Camera, Lock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User as UserType, Booking } from '../types';
import { updateUserProfile, uploadUserAvatar, DEFAULT_BACKEND_ORIGIN, changeUserPassword } from '../utils/auth';

interface ProfilePageProps {
  user: UserType;
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onLogout?: () => void;
}

export default function ProfilePage({ user, bookings, onLogout }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'settings'>('upcoming');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordFeedback(null);

    const result = await changeUserPassword(passwordData);
    
    if (result.success) {
      setPasswordFeedback({ type: 'success', message: 'Thay đổi mật khẩu thành công!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } else {
      setPasswordFeedback({ type: 'error', message: result.message });
    }
    setIsChangingPassword(false);
  };

  const getFullAvatarUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${DEFAULT_BACKEND_ORIGIN}${url}`;
  };

  const [formData, setFormData] = useState({
    full_name: user.name,
    phone: user.phone || '',
    avatar_url: user.avatar
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateFeedback(null);

    const result = await updateUserProfile(formData);
    
    if (result.success) {
      setUpdateFeedback({ type: 'success', message: 'Cập nhật thông tin thành công!' });
    } else {
      setUpdateFeedback({ type: 'error', message: result.message });
    }
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUpdateFeedback(null);

    const result = await uploadUserAvatar(file);
    
    if (result.success && result.avatar_url) {
      setFormData({ ...formData, avatar_url: result.avatar_url });
      setUpdateFeedback({ type: 'success', message: 'Đã tải ảnh đại diện lên thành công!' });
    } else {
      setUpdateFeedback({ type: 'error', message: result.message });
    }
    setIsUploading(false);
  };

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
                    src={getFullAvatarUrl(user.avatar)} 
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
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-yellow-500 text-black' 
                      : 'hover:bg-white/5 text-gray-300 hover:text-white'
                  }`}
                >
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

            {/* Settings View */}
            {activeTab === 'settings' && (
              <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-6">Thông tin cá nhân</h3>
                
                {updateFeedback && (
                  <div className={`mb-6 p-4 rounded-xl border ${
                    updateFeedback.type === 'success' 
                      ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                      : 'bg-red-500/10 border-red-500/50 text-red-400'
                  }`}>
                    {updateFeedback.message}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/10">
                    <div className="relative group mb-4">
                      <img 
                        src={getFullAvatarUrl(formData.avatar_url)} 
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500/30 group-hover:border-yellow-500 transition-colors"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <label className="absolute bottom-1 right-1 w-10 h-10 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110">
                        <Camera className="w-5 h-5" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">Ảnh đại diện</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG tối đa 5MB</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Họ và tên</label>
                      <input 
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Nhập họ tên"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Số điện thoại</label>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Email (Không thể thay đổi)</label>
                    <input 
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-xl transition-all"
                    >
                      {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-yellow-500" />
                    Bảo mật
                  </h3>
                  
                  {/* Google Authenticated User Notice */}
                  {user.avatar.includes('googleusercontent.com') ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mt-4">
                      <p className="text-yellow-500 text-sm">
                        Bạn đang đăng nhập bằng <strong>Google</strong>. Mật khẩu của bạn được quản lý bởi Google và không thể thay đổi trực tiếp tại đây.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <p className="text-gray-400 text-sm mb-6">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                      
                      {passwordFeedback && (
                        <div className={`mb-6 p-4 rounded-xl border ${
                          passwordFeedback.type === 'success' 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}>
                          {passwordFeedback.message}
                        </div>
                      )}

                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Mật khẩu hiện tại</label>
                          <input 
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Mật khẩu mới</label>
                          <input 
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Xác nhận mật khẩu mới</label>
                          <input 
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50"
                          >
                            {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
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
