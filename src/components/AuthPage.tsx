import { useState } from 'react';
import { Page, User } from '../types';
import {
  AuthNotice,
  DEFAULT_AVATAR,
  DEFAULT_BACKEND_ORIGIN,
  fetchCurrentUser,
  getGoogleLoginUrl,
  markGoogleOAuthPending,
  persistAccessToken,
  persistRefreshToken,
  resolvePostLoginPage,
  savePostLoginPage,
} from '../utils/auth';


interface AuthPageProps {
  onNavigate: (page: Page) => void;
  onLogin: (user: User) => void;
  redirectAfterLogin: Page;
  authNotice: AuthNotice | null;
  onClearAuthNotice: () => void;
}

export default function AuthPage({
  onNavigate,
  onLogin,
  redirectAfterLogin,
  authNotice,
  onClearAuthNotice,
}: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    agreeTerms: false,
    subscribeNews: true
  });

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate phone
  const validatePhone = (phone: string) => {
    return /^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone);
  };

  const resetFeedback = () => {
    setErrors({});
    onClearAuthNotice();
  };

  const createFallbackUser = (apiUser: unknown): User | null => {
    if (!apiUser || typeof apiUser !== 'object') {
      return null;
    }

    const userRecord = apiUser as Record<string, unknown>;
    const email =
      typeof userRecord.email === 'string' && userRecord.email.trim()
        ? userRecord.email.trim()
        : '';
    const role =
      typeof userRecord.role === 'string' &&
      ['admin', 'staff', 'customer'].includes(userRecord.role)
        ? (userRecord.role as User['role'])
        : 'customer';

    if (!email) {
      return null;
    }

    return {
      id:
        typeof userRecord.id === 'string' || typeof userRecord.id === 'number'
          ? userRecord.id
          : Date.now(),
      name:
        (typeof userRecord.full_name === 'string' && userRecord.full_name.trim()) ||
        (typeof userRecord.name === 'string' && userRecord.name.trim()) ||
        email,
      email,
      phone: typeof userRecord.phone === 'string' ? userRecord.phone : '',
      avatar:
        (typeof userRecord.avatar_url === 'string' && userRecord.avatar_url) ||
        (typeof userRecord.avatar === 'string' && userRecord.avatar) ||
        DEFAULT_AVATAR,
      membershipLevel: 'Standard',
      points: 0,
      totalSpent: 0,
      role,
    };
  };

  const handleGoogleLogin = () => {
    resetFeedback();
    setIsGoogleLoading(true);
    savePostLoginPage(redirectAfterLogin);
    markGoogleOAuthPending();
    window.location.assign(getGoogleLoginUrl());
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    const newErrors: Record<string, string> = {};

    if (!loginForm.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!loginForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`${DEFAULT_BACKEND_ORIGIN}/api/v1/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginForm.email,
            password: loginForm.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setErrors({
            submit: result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
          });
          setIsLoading(false);
          return;
        }

        const accessToken = result.data?.access_token || result.access_token || result.token;
        const fallbackUser = createFallbackUser(result.data?.user || result.user || result.data);
        if (!accessToken) {
          setErrors({ submit: 'Không nhận được access token từ máy chủ.' });
          setIsLoading(false);
          return;
        }

        persistAccessToken(accessToken);
        
        const refreshToken = result.data?.refresh_token;
        if (refreshToken) {
          persistRefreshToken(refreshToken);
        }

        // Fetch full profile (matching the user's model logic)
        const userResult = await fetchCurrentUser(accessToken);
        if (userResult.user) {
          onLogin(userResult.user);
          setShowSuccess(true);
          setTimeout(() => {
            onNavigate(resolvePostLoginPage(userResult.user!, redirectAfterLogin));
          }, 1500);
        } else if (fallbackUser) {
          onLogin(fallbackUser);
          setShowSuccess(true);
          setTimeout(() => {
            onNavigate(resolvePostLoginPage(fallbackUser, redirectAfterLogin));
          }, 1500);
        } else {
          setErrors({ submit: userResult.errorMessage || 'Không thể lấy thông tin người dùng.' });
        }
      } catch (err) {
        console.error('Login error:', err);
        setErrors({ submit: 'Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    const newErrors: Record<string, string> = {};

    if (!registerForm.fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (registerForm.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!registerForm.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!registerForm.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(registerForm.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!registerForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(registerForm.password)) {
      newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!registerForm.birthDate) {
      newErrors.birthDate = 'Vui lòng chọn ngày sinh';
    }

    if (!registerForm.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    if (!registerForm.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`${DEFAULT_BACKEND_ORIGIN}/api/v1/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: registerForm.fullName,
            email: registerForm.email,
            phone: registerForm.phone,
            password: registerForm.password,
            birth_date: registerForm.birthDate,
            gender: registerForm.gender,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setErrors({
            submit: result.message || 'Đăng ký thất bại. Vui lòng thử lại.',
          });
          return;
        }

        setShowSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setShowSuccess(false);
          setLoginForm({ ...loginForm, email: registerForm.email });
        }, 2000);
      } catch (err) {
        console.error('Register error:', err);
        setErrors({ submit: 'Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Password strength
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(registerForm.password);
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
  const isFormBusy = isLoading || isGoogleLoading;


  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-yellow-500/5 to-transparent rounded-full" />

        {/* Film strip decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-16 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-[5%] border-y-4 border-white/50 my-1" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-16 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-[5%] border-y-4 border-white/50 my-1" />
          ))}
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Đang chuyển hướng...' : 'Vui lòng đăng nhập để tiếp tục'}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <button onClick={() => onNavigate('home')} className="inline-block">
              <h1 className="text-4xl font-black">
                <span className="text-red-500">CINE</span>
                <span className="text-yellow-500">PRO</span>
              </h1>
            </button>
            <p className="text-gray-400 mt-2">Trải nghiệm điện ảnh đỉnh cao</p>
          </div>

          {/* Auth Card */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => {
                  setIsLogin(true);
                  resetFeedback();
                }}
                className={`flex-1 py-4 text-center font-semibold transition-all relative ${isLogin ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Đăng nhập
                {isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  resetFeedback();
                }}
                className={`flex-1 py-4 text-center font-semibold transition-all relative ${!isLogin ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Đăng ký
                {!isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500" />
                )}
              </button>
            </div>

            <div className="p-6 md:p-8">
              {authNotice && (
                <div
                  className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${authNotice.type === 'error'
                      ? 'border-red-500/40 bg-red-500/10 text-red-200'
                      : 'border-green-500/40 bg-green-500/10 text-green-200'
                    }`}
                >
                  {authNotice.message}
                </div>
              )}

              {isLogin ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-5">
                  {errors.submit && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errors.submit}
                    </div>
                  )}
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginForm.remember}
                        onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                      />
                      <span className="ml-2 text-sm text-gray-400">Ghi nhớ đăng nhập</span>
                    </label>
                    <button type="button" className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors">
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isFormBusy}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng nhập</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">Hoặc đăng nhập với</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isFormBusy}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-600 bg-white px-4 py-3 font-semibold text-gray-900 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-gray-900">
                        G
                      </span>
                      <span>{isGoogleLoading ? 'Đang chuyển sang Google...' : 'Tiếp tục với Google'}</span>
                    </button>
                    <p className="text-center text-xs text-gray-500">
                      Frontend sẽ gọi trực tiếp BE qua endpoint
                      {' '}
                      <span className="font-mono text-gray-300">/api/v1/auth/google/login</span>
                    </p>
                  </div>

                  {/* Staff Login Hint */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">👨‍💼</span>
                      <div>
                        <p className="text-sm font-medium text-blue-400 mb-1">Đăng nhập dành cho nhân viên?</p>
                        <p className="text-xs text-gray-400">
                          Sử dụng email có chứa "<span className="text-yellow-500 font-mono">staff</span>" để đăng nhập vào Staff Portal.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          VD: <span className="text-gray-400 font-mono">staff@cinepro.vn</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  {errors.submit && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {errors.submit}
                    </div>
                  )}
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className={`w-full bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                          placeholder="email@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <input
                          type="tel"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className={`w-full bg-gray-800/50 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                          placeholder="0901234567"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {registerForm.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-700'
                                }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength >= 3 ? 'text-green-500' : passwordStrength >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                          Độ mạnh: {strengthLabels[passwordStrength - 1] || 'Rất yếu'}
                        </p>
                      </div>
                    )}
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      {registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword && (
                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  {/* Birth Date & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={registerForm.birthDate}
                        onChange={(e) => setRegisterForm({ ...registerForm, birthDate: e.target.value })}
                        className={`w-full bg-gray-800/50 border ${errors.birthDate ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all`}
                      />
                      {errors.birthDate && <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                          <label
                            key={g}
                            className={`flex-1 py-3 px-4 rounded-xl border cursor-pointer transition-all text-center ${registerForm.gender === g
                                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500'
                                : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                              }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={registerForm.gender === g}
                              onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                              className="hidden"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                      {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Terms & Newsletter */}
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 cursor-pointer ${errors.agreeTerms ? 'text-red-500' : ''}`}>
                      <input
                        type="checkbox"
                        checked={registerForm.agreeTerms}
                        onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-400">
                        Tôi đồng ý với <button type="button" className="text-yellow-500 hover:underline">Điều khoản sử dụng</button> và <button type="button" className="text-yellow-500 hover:underline">Chính sách bảo mật</button> <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-sm text-red-500 ml-8">{errors.agreeTerms}</p>}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={registerForm.subscribeNews}
                        onChange={(e) => setRegisterForm({ ...registerForm, subscribeNews: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-400">
                        Nhận thông tin khuyến mãi & phim mới qua email
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isFormBusy}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Đang tạo tài khoản...</span>
                      </>
                    ) : (
                      <>
                        <span>Tạo tài khoản</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Benefits Banner */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-t border-gray-800 p-4">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tích điểm mỗi giao dịch</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>Ưu đãi độc quyền</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 CINEPRO. Tất cả quyền được bảo lưu.</p>
            <div className="mt-2 flex items-center justify-center gap-4">
              <button className="hover:text-yellow-500 transition-colors">Hỗ trợ</button>
              <span>•</span>
              <button className="hover:text-yellow-500 transition-colors">Liên hệ</button>
              <span>•</span>
              <button className="hover:text-yellow-500 transition-colors">FAQ</button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        @keyframes check {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-check path {
          stroke-dasharray: 24;
          animation: check 0.4s ease-out 0.2s forwards;
          stroke-dashoffset: 24;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
