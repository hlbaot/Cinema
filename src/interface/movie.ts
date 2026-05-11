export interface Movie {
    id: string;
    title: string;
    duration_minutes: number;
    genre: string[];
    status: string;
    age_rating: string;
    poster_url: string;
    trailer_url: string;
    actor: string[];
    start_date: string;
    description?: string;
    score?: number;
}

export interface MovieResponse {
    success: boolean;
    data: {
        message: string;
        movies: Movie[];
    };
}

export interface SessionObject {
  id: string
  time?: string
  start_time?: string
}

export interface SeatItem {
  id: string
  showtime_id: string
  seat_id: string
  seat_row: string
  seat_number: number
  type: 'standard' | 'vip' | 'couple'
  price: number
  status: 'available' | 'selected' | 'reserved' | 'sold' | 'booked'
}

export interface RoomObject {
    room_id: string;
    room_name: string;
    format: string;
    sessions: SessionObject[];
}

export interface ShowtimeGroup {
    date: string;
    rooms: RoomObject[];
}

export interface MovieDetail extends Movie {
    director: string;
    end_date: string;
    showtimes?: ShowtimeGroup[];
}

export interface DetailMovieResponse {
    success: boolean;
    data: MovieDetail;
}
