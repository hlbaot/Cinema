export interface Movie {
  id: number;
  title: string;
  genre: string[];
  duration: string;
  rating: string;
  releaseDate: string;
  director: string;
  synopsis: string;
  poster: string;
  banner: string;
  tomatometer: number;
  userRating: number;
  actors: Actor[];
}

export interface Actor {
  id: number;
  name: string;
  role: string;
  image: string;
}

export interface Cinema {
  id: number;
  name: string;
  address: string;
  hotline: string;
  image: string;
  features: string[];
  lat: number;
  lng: number;
}

export interface Showtime {
  id: number;
  cinemaId: number;
  cinemaName: string;
  format: 'IMAX' | '2D' | '3D' | 'Gold Class' | '4DX';
  time: string;
  date: string;
  status: 'available' | 'filling' | 'soldout';
  price: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple' | 'wheelchair';
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

// Booking status flow:
// pending -> confirmed (staff approved) -> checked_in (customer arrived)
// pending -> rejected (staff rejected)
// pending/confirmed -> cancelled (user/staff cancelled)
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'checked_in' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  movie: Movie;
  cinema: Cinema;
  showtime: Showtime;
  seats: Seat[];
  totalPrice: number;
  paymentMethod: string;
  status: BookingStatus;
  qrCode: string;
  bookedAt: string;
  // Customer info
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Staff actions
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  checkedInBy?: string;
  checkedInAt?: string;
  // Notes
  notes?: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipLevel: 'Standard' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpent: number;
  role?: 'customer' | 'staff' | 'admin';
}

// Notification for user
export interface Notification {
  id: string;
  userId: number;
  type: 'booking_confirmed' | 'booking_rejected' | 'booking_reminder' | 'promotion';
  title: string;
  message: string;
  bookingId?: string;
  isRead: boolean;
  createdAt: string;
}

export type Page = 'home' | 'movies' | 'movie-detail' | 'seat-selection' | 'cinemas' | 'payment' | 'profile' | 'confirmation' | 'auth' | 'staff' | 'admin';
