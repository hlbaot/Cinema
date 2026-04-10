'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Page, Movie, Showtime, Cinema, Seat, User } from './types';
import { mockMovies, mockCinemas, mockShowtimes, mockUser, mockBookings } from './data/mockData';

import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import MoviesPage from './components/MoviesPage';
import MovieDetail from './components/MovieDetail';
import SeatSelection from './components/SeatSelection';
import CinemasPage from './components/CinemasPage';
import PaymentPage from './components/PaymentPage';
import ConfirmationPage from './components/ConfirmationPage';
import ProfilePage from './components/ProfilePage';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import {
  AuthNotice,
  clearPostLoginPage,
  clearStoredAccessToken,
  clearStoredUser,
  consumeGoogleOAuthCallback,
  fetchCurrentUser,
  finalizeGoogleOAuthAttempt,
  loadStoredAccessToken,
  loadStoredUser,
  logoutUser,
  persistAccessToken,
  persistRefreshToken,
  clearStoredRefreshToken,
  persistUser,
  resolvePostLoginPage,
  savePostLoginPage,
} from './utils/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [postLoginPage, setPostLoginPage] = useState<Page>('home');
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null);
  const [hasHydratedAuth, setHasHydratedAuth] = useState(false);
  const [bookings, setBookings] = useState(mockBookings);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const currentUserRef = useRef<User | null>(currentUser);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      const storedUser = loadStoredUser();
      const storedAccessToken = loadStoredAccessToken();
      
      // Determine if we should process an OAuth callback
      const hasOAuthSignals = 
        searchParams.has('provider') || 
        searchParams.has('oauth') || 
        searchParams.has('status') || 
        searchParams.has('accessToken') || 
        searchParams.has('access_token') ||
        searchParams.has('token');

      const oauthResult = hasOAuthSignals ? consumeGoogleOAuthCallback(searchParams) : null;
      
      let nextUser = oauthResult?.user ?? storedUser;
      let nextNotice = oauthResult?.notice;
      let resolvedOAuthUser = Boolean(oauthResult?.user);
      const accessToken = oauthResult?.accessToken ?? storedAccessToken;

      if (oauthResult?.redirectPage && isMounted) {
        setPostLoginPage(oauthResult.redirectPage);
      }

      if (oauthResult?.accessToken) {
        persistAccessToken(oauthResult.accessToken);
      }

      if (oauthResult?.refreshToken) {
        persistRefreshToken(oauthResult.refreshToken);
      }

      if (!nextUser && (oauthResult?.shouldFetchCurrentUser || (!oauthResult && accessToken))) {
        const currentUserResult = await fetchCurrentUser(accessToken ?? undefined);

        if (!isMounted) {
          return;
        }

        if (oauthResult) {
          finalizeGoogleOAuthAttempt();
        }

        if (currentUserResult.user) {
          nextUser = currentUserResult.user;
          resolvedOAuthUser = oauthResult ? true : resolvedOAuthUser;
        } else if (accessToken && oauthResult) {
          nextNotice = {
            type: 'error',
            message:
              currentUserResult.errorMessage ??
              'Đăng nhập Google thành công ở backend nhưng frontend chưa lấy được hồ sơ người dùng.',
          };
        }
      }

      if (nextNotice?.type === 'error' && isMounted) {
        setAuthNotice(nextNotice);
        setCurrentPage('auth');
      }

      if (nextUser && isMounted) {
        setCurrentUser(nextUser);

        if (resolvedOAuthUser) {
          setCurrentPage(resolvePostLoginPage(nextUser, oauthResult?.redirectPage ?? null));
          setPreviousPage('home');
        }
      }

      // Cleanup URL if we had signals
      if (hasOAuthSignals && isMounted) {
        router.replace('/', { scroll: false });
      }

      if (isMounted) {
        setHasHydratedAuth(true);
      }
    };

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  useEffect(() => {
    if (!hasHydratedAuth) {
      return;
    }

    if (currentUser) {
      persistUser(currentUser);
      return;
    }

    clearStoredUser();
    clearStoredAccessToken();
    clearStoredRefreshToken();
  }, [currentUser, hasHydratedAuth]);

  // Get filtered showtimes for selected movie
  const movieShowtimes = useMemo(() => {
    if (!selectedMovie) return [];
    return mockShowtimes;
  }, [selectedMovie]);

  // Navigation handlers
  const handleNavigate = (page: Page) => {
    let nextPage = page;
    const activeUser = currentUserRef.current;
    let nextPostLoginPage: Page | null = null;

    if (page === 'profile' && !activeUser) {
      nextPage = 'auth';
      nextPostLoginPage = 'profile';
    }

    if (page === 'staff' && activeUser?.role !== 'staff') {
      nextPage = 'auth';
      nextPostLoginPage = 'staff';
    }

    if (page === 'admin' && activeUser?.role !== 'admin') {
      nextPage = 'auth';
      nextPostLoginPage = 'admin';
    }

    if (nextPage === 'auth') {
      const targetPage = nextPostLoginPage ?? 'home';
      setPostLoginPage(targetPage);
      savePostLoginPage(targetPage);
      setAuthNotice(null);
    } else {
      setPostLoginPage('home');
      clearPostLoginPage();
    }

    setPreviousPage(currentPage);
    setCurrentPage(nextPage);
    window.scrollTo(0, 0);
  };

  const handleSelectMovie = (movie: Movie) => {
    setPreviousPage(currentPage);
    setSelectedMovie(movie);
    setCurrentPage('movie-detail');
    window.scrollTo(0, 0);
  };

  const handleSelectShowtime = (showtime: Showtime, cinema: Cinema) => {
    setSelectedShowtime(showtime);
    setSelectedCinema(cinema);
    setCurrentPage('seat-selection');
    window.scrollTo(0, 0);
  };

  const handleSeatsSelected = (seats: Seat[]) => {
    setSelectedSeats(seats);
    setCurrentPage('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentConfirm = (method: string) => {
    setPaymentMethod(method);
    // Generate a booking ID
    const newBookingId = `CP${Date.now().toString().slice(-8)}`;
    setBookingId(newBookingId);
    setCurrentPage('confirmation');
    window.scrollTo(0, 0);
  };

  const handleSelectCinema = (_cinema: Cinema) => {
    // Select a default movie and navigate to movie detail
    setPreviousPage('cinemas');
    setSelectedMovie(mockMovies[0]);
    setCurrentPage('movie-detail');
    window.scrollTo(0, 0);
  };

  const handleGoHome = () => {
    // Reset state
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedCinema(null);
    setSelectedSeats([]);
    setPaymentMethod('');
    setBookingId('');
    setPreviousPage('home');
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    clearPostLoginPage();
    setPostLoginPage('home');
    setAuthNotice(null);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    const logoutResult = await logoutUser();

    if (!logoutResult.success) {
      console.warn(logoutResult.message);
    }

    // Clear URL signals to prevent re-hydration from URL params
    router.replace('/', { scroll: false });
    
    clearPostLoginPage();
    clearStoredAccessToken();
    clearStoredRefreshToken();
    clearStoredUser();
    setPostLoginPage('home');
    setAuthNotice(null);
    setCurrentUser(null);
    setPreviousPage(currentPage);
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const handleApproveBooking = (bookingId: string) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
            ...booking,
            status: 'confirmed',
            approvedBy: currentUser?.name ?? 'Staff CINEPRO',
            approvedAt: new Date().toISOString(),
            rejectionReason: undefined,
          }
          : booking
      )
    );
  };

  const handleRejectBooking = (bookingId: string, reason: string) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
            ...booking,
            status: 'rejected',
            rejectedBy: currentUser?.name ?? 'Staff CINEPRO',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
          : booking
      )
    );
  };

  const handleCheckInBooking = (bookingId: string) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
            ...booking,
            status: 'checked_in',
            checkedInBy: currentUser?.name ?? 'Staff CINEPRO',
            checkedInAt: new Date().toISOString(),
          }
          : booking
      )
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            movies={mockMovies}
            onSelectMovie={handleSelectMovie}
            onViewAllMovies={() => handleNavigate('movies')}
          />
        );

      case 'movies':
        return (
          <MoviesPage
            movies={mockMovies}
            onSelectMovie={handleSelectMovie}
          />
        );

      case 'movie-detail':
        if (!selectedMovie) return null;
        return (
          <MovieDetail
            movie={selectedMovie}
            showtimes={movieShowtimes}
            cinemas={mockCinemas}
            onSelectShowtime={handleSelectShowtime}
            onBack={() => handleNavigate(previousPage)}
          />
        );

      case 'seat-selection':
        if (!selectedMovie || !selectedShowtime || !selectedCinema) return null;
        return (
          <SeatSelection
            movie={selectedMovie}
            showtime={selectedShowtime}
            cinema={selectedCinema}
            onContinue={handleSeatsSelected}
            onBack={() => handleNavigate('movie-detail')}
          />
        );

      case 'cinemas':
        return (
          <CinemasPage
            cinemas={mockCinemas}
            onSelectCinema={handleSelectCinema}
          />
        );

      case 'payment':
        if (!selectedMovie || !selectedShowtime || !selectedCinema || selectedSeats.length === 0) return null;
        return (
          <PaymentPage
            movie={selectedMovie}
            showtime={selectedShowtime}
            cinema={selectedCinema}
            selectedSeats={selectedSeats}
            onConfirm={handlePaymentConfirm}
            onBack={() => handleNavigate('seat-selection')}
          />
        );

      case 'confirmation':
        if (!selectedMovie || !selectedShowtime || !selectedCinema || selectedSeats.length === 0) return null;
        return (
          <ConfirmationPage
            movie={selectedMovie}
            showtime={selectedShowtime}
            cinema={selectedCinema}
            selectedSeats={selectedSeats}
            paymentMethod={paymentMethod}
            bookingId={bookingId}
            onGoHome={handleGoHome}
            onViewBookings={() => handleNavigate('profile')}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            user={currentUser ?? mockUser}
            bookings={bookings}
            onSelectBooking={() => { }}
            onLogout={handleLogout}
          />
        );

      case 'auth':
        return (
          <AuthPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            redirectAfterLogin={postLoginPage}
            authNotice={authNotice}
            onClearAuthNotice={() => setAuthNotice(null)}
          />
        );

      case 'staff':
        return (
          <StaffDashboard
            bookings={bookings}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
            onCheckInBooking={handleCheckInBooking}
            onLogout={handleLogout}
          />
        );

      case 'admin':
        return (
          <AdminDashboard
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  const isStandalonePage =
    currentPage === 'auth' ||
    currentPage === 'staff' ||
    currentPage === 'admin';

  return (
    <div className="min-h-screen bg-black text-white">
      {!isStandalonePage && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={Boolean(currentUser)}
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main>
        {renderPage()}
      </main>

      {!isStandalonePage && <Footer />}
    </div>
  );
}
