import { useState } from 'react';
import { Play, Star, Clock, Calendar, MapPin, ChevronRight, ChevronLeft, X, Volume2, Users, Award, Film } from 'lucide-react';
import { Movie, Showtime, Cinema } from '../types';

interface MovieDetailProps {
  movie: Movie;
  showtimes: Showtime[];
  cinemas: Cinema[];
  onSelectShowtime: (showtime: Showtime, cinema: Cinema) => void;
  onBack: () => void;
}

export default function MovieDetail({ 
  movie, 
  showtimes, 
  cinemas,
  onSelectShowtime,
  onBack 
}: MovieDetailProps) {
  const [selectedDate, setSelectedDate] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [expandedCinema, setExpandedCinema] = useState<number | null>(1);

  // Generate dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: date.getDate(),
      month: date.getMonth() + 1,
      full: date.toISOString().split('T')[0]
    };
  });

  // Group showtimes by cinema
  const groupedShowtimes = cinemas.map(cinema => ({
    cinema,
    showtimes: showtimes.filter(s => s.cinemaId === cinema.id)
  })).filter(g => g.showtimes.length > 0);

  // Group showtimes by format
  const getShowtimesByFormat = (cinemaShowtimes: Showtime[]) => {
    const formats: { [key: string]: Showtime[] } = {};
    cinemaShowtimes.forEach(s => {
      if (!formats[s.format]) formats[s.format] = [];
      formats[s.format].push(s);
    });
    return formats;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-zinc-800 hover:bg-yellow-500 hover:text-black border-zinc-700 hover:border-yellow-500';
      case 'filling':
        return 'bg-orange-500/20 hover:bg-orange-500 border-orange-500/50 hover:border-orange-500 text-orange-400 hover:text-black';
      case 'soldout':
        return 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed';
      default:
        return 'bg-zinc-800 border-zinc-700';
    }
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'IMAX':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Gold Class':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case '4DX':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '3D':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button 
            onClick={() => setShowTrailer(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Film className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-white text-xl font-medium">Trailer: {movie.title}</p>
              <p className="text-gray-400 mt-2">Video trailer sẽ được phát tại đây</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${movie.banner})` }}
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20 w-full">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-end">
              {/* Poster */}
              <div className="hidden lg:block w-72 flex-shrink-0 transform translate-y-20">
                <div className="relative group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border-2 border-white/10 group-hover:border-yellow-500/50 transition-all duration-300">
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Play Button Overlay */}
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black fill-black ml-1" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 lg:pb-20">
                {/* Back Button */}
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Quay lại</span>
                </button>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/25">
                    ĐANG CHIẾU
                  </span>
                  <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-white/20">
                    {movie.rating}
                  </span>
                  <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                    Hot 🔥
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                  {movie.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{movie.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    <span>Khởi chiếu: {movie.releaseDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-yellow-500" />
                    <span>Phụ đề Việt</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {movie.genre.map((g) => (
                    <span 
                      key={g} 
                      className="px-4 py-2 bg-white/5 text-white text-sm rounded-full backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-colors"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Xem Trailer</span>
                  </button>
                  <a 
                    href="#showtimes"
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all font-bold shadow-lg shadow-yellow-500/25"
                  >
                    <span>Mua Vé Ngay</span>
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Ratings */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-900/40 to-red-950/20 border border-red-500/20 overflow-hidden group hover:border-red-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <div className="text-5xl">🍅</div>
                  <div>
                    <div className="text-4xl font-black text-white">{movie.tomatometer}%</div>
                    <div className="text-red-400 font-medium">Tomatometer</div>
                    <div className="text-sm text-gray-400 mt-1">Giới phê bình</div>
                  </div>
                </div>
              </div>
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-yellow-900/40 to-yellow-950/20 border border-yellow-500/20 overflow-hidden group hover:border-yellow-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                  <div>
                    <div className="text-4xl font-black text-white">{movie.userRating}%</div>
                    <div className="text-yellow-400 font-medium">Audience Score</div>
                    <div className="text-sm text-gray-400 mt-1">Người xem</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Film className="w-6 h-6 text-yellow-500" />
                Nội dung phim
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{movie.synopsis}</p>
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-400">Đạo diễn:</span>
                  <span className="text-white font-medium">{movie.director}</span>
                </div>
              </div>
            </div>

            {/* Cast */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-500" />
                Diễn viên
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {movie.actors.map((actor) => (
                  <div key={actor.id} className="text-center group cursor-pointer">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-3 border-zinc-700 group-hover:border-yellow-500 transition-all duration-300 shadow-lg">
                        <img 
                          src={actor.image} 
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{actor.name}</h4>
                    <p className="text-gray-500 text-sm mt-1">vai {actor.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Showtimes */}
          <div className="lg:col-span-1" id="showtimes">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-yellow-500" />
                Lịch chiếu
              </h2>
              
              {/* Date Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i)}
                    className={`flex flex-col items-center min-w-[70px] px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedDate === i 
                        ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25' 
                        : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                    }`}
                  >
                    <span className="text-xs opacity-75">{date.day}</span>
                    <span className="text-lg font-bold">{date.date}</span>
                    <span className="text-xs opacity-75">Th{date.month}</span>
                  </button>
                ))}
              </div>

              {/* Cinema List */}
              <div className="space-y-4">
                {groupedShowtimes.map(({ cinema, showtimes: cinemaShowtimes }) => (
                  <div 
                    key={cinema.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      expandedCinema === cinema.id 
                        ? 'bg-zinc-900/80 border-yellow-500/30' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Cinema Header */}
                    <button
                      onClick={() => setExpandedCinema(expandedCinema === cinema.id ? null : cinema.id)}
                      className="w-full p-4 flex items-start gap-4 text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        expandedCinema === cinema.id 
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' 
                          : 'bg-red-600/20'
                      }`}>
                        <span className={`font-bold text-lg ${
                          expandedCinema === cinema.id ? 'text-black' : 'text-red-500'
                        }`}>C</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white">{cinema.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-1">{cinema.address}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cinema.features.slice(0, 3).map(f => (
                            <span key={f} className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-xs rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedCinema === cinema.id ? 'rotate-90' : ''
                      }`} />
                    </button>

                    {/* Showtimes */}
                    {expandedCinema === cinema.id && (
                      <div className="px-4 pb-4 space-y-4">
                        {Object.entries(getShowtimesByFormat(cinemaShowtimes)).map(([format, times]) => (
                          <div key={format}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getFormatBadgeColor(format)}`}>
                                {format}
                              </span>
                              <div className="flex-1 h-px bg-zinc-800" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {times.map((showtime) => (
                                <button
                                  key={showtime.id}
                                  onClick={() => showtime.status !== 'soldout' && onSelectShowtime(showtime, cinema)}
                                  disabled={showtime.status === 'soldout'}
                                  className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${getStatusStyle(showtime.status)}`}
                                >
                                  <span>{showtime.time}</span>
                                  {showtime.status === 'filling' && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="text-xs text-gray-500 mb-3 font-medium">Chú thích:</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="text-gray-400">Còn chỗ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-400">Sắp đầy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700" />
                    <span className="text-gray-400">Hết vé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
