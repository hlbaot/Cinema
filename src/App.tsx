'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState(mockBookings);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const currentUserRef = useRef<User | null>(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Get filtered showtimes for selected movie
  const movieShowtimes = useMemo(() => {
    if (!selectedMovie) return [];
    return mockShowtimes;
  }, [selectedMovie]);

  // Navigation handlers
  const handleNavigate = (page: Page) => {
    let nextPage = page;
    const activeUser = currentUserRef.current;

    if (page === 'profile' && !activeUser) {
      nextPage = 'auth';
    }

    if (page === 'staff' && activeUser?.role !== 'staff') {
      nextPage = 'auth';
    }

    if (page === 'admin' && activeUser?.role !== 'admin') {
      nextPage = 'auth';
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
    setCurrentUser(user);
  };

  const handleLogout = () => {
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
            onSelectBooking={() => {}}
            onLogout={handleLogout}
          />
        );

      case 'auth':
        return (
          <AuthPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
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
