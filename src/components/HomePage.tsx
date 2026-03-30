import { Play, Star, Clock, Calendar, ChevronRight, Ticket } from 'lucide-react';
import { Movie } from '../types';

interface HomePageProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onViewAllMovies?: () => void;
}

export default function HomePage({ movies, onSelectMovie, onViewAllMovies }: HomePageProps) {
  const featuredMovie = movies[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[80vh] lg:h-[90vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featuredMovie.banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl pt-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                ĐANG CHIẾU
              </span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded backdrop-blur">
                {featuredMovie.rating}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">
              {featuredMovie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{featuredMovie.userRating}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{featuredMovie.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{featuredMovie.releaseDate}</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm sm:text-base mb-8 line-clamp-3">
              {featuredMovie.synopsis}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onSelectMovie(featuredMovie)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                <Ticket className="w-5 h-5" />
                MUA VÉ NGAY
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-xl backdrop-blur hover:bg-white/20 transition-all border border-white/20">
                <Play className="w-5 h-5" />
                XEM TRAILER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="py-16 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">Phim đang chiếu</h2>
              <p className="text-gray-400 mt-1">Những bộ phim hot nhất hiện nay</p>
            </div>
            <button
              onClick={onViewAllMovies}
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => onSelectMovie(movie)} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">Phim sắp chiếu</h2>
              <p className="text-gray-400 mt-1">Đừng bỏ lỡ những bộ phim bom tấn</p>
            </div>
            <button
              onClick={onViewAllMovies}
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Xem tất cả
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {movies.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => onSelectMovie(movie)} comingSoon />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎬", title: "Công nghệ IMAX", desc: "Trải nghiệm điện ảnh đỉnh cao với màn hình khổng lồ" },
              { icon: "🔊", title: "Dolby Atmos", desc: "Âm thanh vòm 3D chân thực, sống động" },
              { icon: "🛋️", title: "Gold Class", desc: "Ghế ngồi cao cấp, phục vụ tại chỗ" },
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-colors group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MovieCard({ 
  movie, 
  onClick, 
  comingSoon = false 
}: { 
  movie: Movie; 
  onClick: () => void;
  comingSoon?: boolean;
}) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {comingSoon ? (
          <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
            SẮP CHIẾU
          </div>
        ) : (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            HOT
          </div>
        )}
        
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded backdrop-blur">
          {movie.rating}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-lg hover:scale-105 transition-transform">
            {comingSoon ? 'XEM CHI TIẾT' : 'MUA VÉ'}
          </button>
        </div>
      </div>
      
      <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
        {movie.title}
      </h3>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>{movie.userRating}%</span>
        </div>
        <span>•</span>
        <span>{movie.duration}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {movie.genre.slice(0, 2).map((g) => (
          <span key={g} className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
