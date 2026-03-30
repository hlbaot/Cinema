import { Film, Search, User, Menu, X, LogOut, Ticket, Settings, ChevronDown } from 'lucide-react';
import { Page, User as UserType } from '../types';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isLoggedIn?: boolean;
  user?: UserType | null;
  onLogout?: () => void;
}

export default function Header({ currentPage, onNavigate, isLoggedIn = false, user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Trang chủ', page: 'home' as Page },
    { label: 'Phim', page: 'movies' as Page },
    { label: 'Rạp chiếu', page: 'cinemas' as Page },
    { label: 'Khuyến mãi', page: 'home' as Page },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'VIP': return 'from-yellow-500 to-amber-600';
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold">
              <span className="text-red-500">CINE</span>
              <span className="text-white">PRO</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-medium transition-colors hover:text-yellow-400 ${
                  currentPage === item.page ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Tìm kiếm...</span>
            </button>
            
            {isLoggedIn && user ? (
              /* Logged In User Menu */
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-all"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getMembershipColor(user.membershipLevel)} flex items-center justify-center text-black font-bold text-sm`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info - Desktop only */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-yellow-500">{user.membershipLevel} • {user.points.toLocaleString()} điểm</p>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-fade-in">
                    {/* User Info Card */}
                    <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMembershipColor(user.membershipLevel)} flex items-center justify-center text-black font-bold text-lg`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getMembershipColor(user.membershipLevel)} text-black font-medium`}>
                              {user.membershipLevel}
                            </span>
                            <span className="text-xs text-gray-400">{user.points.toLocaleString()} điểm</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Points Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Điểm tích lũy</span>
                          <span>{user.points.toLocaleString()} / 5,000</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                            style={{ width: `${Math.min((user.points / 5000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Tài khoản của tôi</p>
                          <p className="text-xs text-gray-500">Thông tin cá nhân</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <Ticket className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Vé của tôi</p>
                          <p className="text-xs text-gray-500">Lịch sử đặt vé</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <Settings className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Cài đặt</p>
                          <p className="text-xs text-gray-500">Tùy chọn tài khoản</p>
                        </div>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-800">
                      <button
                        onClick={() => {
                          onLogout?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                      >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        <span className="text-sm text-gray-400 group-hover:text-red-500">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <button 
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full hover:from-yellow-400 hover:to-amber-500 transition-all group"
              >
                <User className="w-4 h-4 text-black" />
                <span className="hidden sm:inline text-sm font-medium text-black">Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 animate-fade-in">
            {/* User Info on Mobile */}
            {isLoggedIn && user && (
              <div className="px-4 py-3 mb-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMembershipColor(user.membershipLevel)} flex items-center justify-center text-black font-bold text-lg`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-yellow-500">{user.membershipLevel} • {user.points.toLocaleString()} điểm</p>
                  </div>
                </div>
              </div>
            )}
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 text-left rounded-lg transition-colors ${
                    currentPage === item.page 
                      ? 'bg-yellow-500/10 text-yellow-400' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-3"
                  >
                    <User className="w-5 h-5" />
                    Tài khoản
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg text-red-500 hover:bg-red-500/10 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="mx-4 mt-2 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg text-black font-semibold text-center"
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
