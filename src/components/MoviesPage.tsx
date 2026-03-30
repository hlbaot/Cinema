import { useState, useMemo } from 'react';
import { Movie } from '../types';

interface MoviesPageProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

// Extended mock movies for the movies page
const extendedMovies: Movie[] = [
  {
    id: 1,
    title: "DUNE: PART TWO",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: "166 phút",
    rating: "C16",
    releaseDate: "2024-03-01",
    director: "Denis Villeneuve",
    synopsis: "Paul Atreides hợp nhất với Chani và người Fremen trong khi trên con đường trả thù những kẻ đã hủy hoại gia đình anh.",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&h=800&fit=crop",
    tomatometer: 93,
    userRating: 95,
    actors: []
  },
  {
    id: 2,
    title: "OPPENHEIMER",
    genre: ["Biography", "Drama", "History"],
    duration: "180 phút",
    rating: "C18",
    releaseDate: "2023-07-21",
    director: "Christopher Nolan",
    synopsis: "Câu chuyện về J. Robert Oppenheimer và vai trò của ông trong việc phát triển bom nguyên tử.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=800&fit=crop",
    tomatometer: 93,
    userRating: 91,
    actors: []
  },
  {
    id: 3,
    title: "GODZILLA x KONG",
    genre: ["Action", "Sci-Fi", "Adventure"],
    duration: "115 phút",
    rating: "C13",
    releaseDate: "2024-03-29",
    director: "Adam Wingard",
    synopsis: "Hai titan huyền thoại Godzilla và Kong hợp sức chống lại mối đe dọa mới.",
    poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 54,
    userRating: 88,
    actors: []
  },
  {
    id: 4,
    title: "KUNG FU PANDA 4",
    genre: ["Animation", "Action", "Comedy"],
    duration: "94 phút",
    rating: "P",
    releaseDate: "2024-03-08",
    director: "Mike Mitchell",
    synopsis: "Po phải huấn luyện một chiến binh mới khi anh được chọn trở thành Lãnh đạo tinh thần của Thung lũng Hòa bình.",
    poster: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 71,
    userRating: 85,
    actors: []
  },
  {
    id: 5,
    title: "DEADPOOL & WOLVERINE",
    genre: ["Action", "Comedy", "Sci-Fi"],
    duration: "127 phút",
    rating: "C18",
    releaseDate: "2024-07-26",
    director: "Shawn Levy",
    synopsis: "Deadpool và Wolverine hợp tác trong cuộc phiêu lưu xuyên đa vũ trụ đầy hỗn loạn.",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 89,
    userRating: 94,
    actors: []
  },
  {
    id: 6,
    title: "INSIDE OUT 2",
    genre: ["Animation", "Adventure", "Comedy"],
    duration: "96 phút",
    rating: "P",
    releaseDate: "2024-06-14",
    director: "Kelsey Mann",
    synopsis: "Riley bước vào tuổi dậy thì và trụ sở chính cảm xúc đang trải qua một cuộc cải tạo đột ngột.",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 91,
    userRating: 92,
    actors: []
  },
  {
    id: 7,
    title: "FURIOSA: A MAD MAX SAGA",
    genre: ["Action", "Adventure", "Sci-Fi"],
    duration: "148 phút",
    rating: "C16",
    releaseDate: "2024-05-24",
    director: "George Miller",
    synopsis: "Câu chuyện nguồn gốc của Imperator Furiosa trước khi cô gặp Max Rockatansky.",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 90,
    userRating: 87,
    actors: []
  },
  {
    id: 8,
    title: "THE FALL GUY",
    genre: ["Action", "Comedy", "Romance"],
    duration: "126 phút",
    rating: "C13",
    releaseDate: "2024-05-03",
    director: "David Leitch",
    synopsis: "Một người đóng thế bị kéo vào cuộc tìm kiếm một ngôi sao điện ảnh mất tích.",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 82,
    userRating: 89,
    actors: []
  },
  {
    id: 9,
    title: "A QUIET PLACE: DAY ONE",
    genre: ["Horror", "Drama", "Sci-Fi"],
    duration: "99 phút",
    rating: "C16",
    releaseDate: "2024-06-28",
    director: "Michael Sarnoski",
    synopsis: "Câu chuyện về ngày đầu tiên khi sinh vật ngoài hành tinh xâm chiếm Trái đất.",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 85,
    userRating: 83,
    actors: []
  },
  {
    id: 10,
    title: "JOKER: FOLIE À DEUX",
    genre: ["Crime", "Drama", "Musical"],
    duration: "138 phút",
    rating: "C18",
    releaseDate: "2024-10-04",
    director: "Todd Phillips",
    synopsis: "Arthur Fleck gặp tình yêu của đời mình, Harley Quinn, trong bệnh viện tâm thần Arkham.",
    poster: "https://images.unsplash.com/photo-1559583109-3e7968136c99?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 0,
    userRating: 0,
    actors: []
  },
  {
    id: 11,
    title: "ALIEN: ROMULUS",
    genre: ["Horror", "Sci-Fi", "Thriller"],
    duration: "119 phút",
    rating: "C18",
    releaseDate: "2024-08-16",
    director: "Fede Álvarez",
    synopsis: "Một nhóm thợ mỏ không gian trẻ tuổi khám phá một trạm không gian bị bỏ hoang.",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 0,
    userRating: 0,
    actors: []
  },
  {
    id: 12,
    title: "VENOM: THE LAST DANCE",
    genre: ["Action", "Adventure", "Sci-Fi"],
    duration: "120 phút",
    rating: "C16",
    releaseDate: "2024-10-25",
    director: "Kelly Marcel",
    synopsis: "Eddie Brock và Venom trong cuộc chiến cuối cùng với kẻ thù mạnh nhất từ trước đến nay.",
    poster: "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
    tomatometer: 0,
    userRating: 0,
    actors: []
  }
];

const allGenres = ["Tất cả", "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Drama", "Horror", "Musical", "Romance", "Sci-Fi", "Thriller", "History"];
const allRatings = ["Tất cả", "P", "C13", "C16", "C18"];

export default function MoviesPage({ movies: _, onSelectMovie }: MoviesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [selectedRating, setSelectedRating] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState<'now' | 'coming'>('now');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'name'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const allMovies = useMemo(() => {
    const seenTitles = new Set<string>();

    return [..._, ...extendedMovies].filter((movie) => {
      const normalizedTitle = movie.title.trim().toLowerCase();

      if (seenTitles.has(normalizedTitle)) {
        return false;
      }

      seenTitles.add(normalizedTitle);
      return true;
    });
  }, [_]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let result = [...allMovies];

    // Search filter
    if (searchQuery) {
      result = result.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== 'Tất cả') {
      result = result.filter(movie => movie.genre.includes(selectedGenre));
    }

    // Rating filter
    if (selectedRating !== 'Tất cả') {
      result = result.filter(movie => movie.rating === selectedRating);
    }

    // Status filter (now showing vs coming soon)
    const today = new Date();
    if (selectedStatus === 'now') {
      result = result.filter(movie => new Date(movie.releaseDate) <= today);
    } else {
      result = result.filter(movie => new Date(movie.releaseDate) > today);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.tomatometer - a.tomatometer);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [allMovies, searchQuery, selectedGenre, selectedRating, selectedStatus, sortBy]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'P': return 'bg-green-500';
      case 'C13': return 'bg-yellow-500';
      case 'C16': return 'bg-orange-500';
      case 'C18': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingDescription = (rating: string) => {
    switch (rating) {
      case 'P': return 'Phổ biến';
      case 'C13': return '13+';
      case 'C16': return '16+';
      case 'C18': return '18+';
      default: return rating;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500">
              Phim
            </span>
            {' '}Đang Chiếu
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
            Khám phá những bộ phim bom tấn mới nhất với trải nghiệm điện ảnh đỉnh cao tại CINEPRO
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm phim, đạo diễn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-black via-black to-transparent py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Status Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex bg-gray-900/80 backdrop-blur-sm rounded-full p-1 border border-gray-800">
              <button
                onClick={() => setSelectedStatus('now')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedStatus === 'now'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎬 Đang Chiếu
              </button>
              <button
                onClick={() => setSelectedStatus('coming')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedStatus === 'coming'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎞️ Sắp Chiếu
              </button>
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'name')}
                className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-500 text-sm py-2">Thể loại:</span>
              {allGenres.slice(0, 8).map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black'
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
              {allGenres.length > 8 && (
                <div className="relative group">
                  <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700 transition-all">
                    Thêm +
                  </button>
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl p-2 hidden group-hover:block z-50 min-w-[150px]">
                    {allGenres.slice(8).map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-gray-800 self-center mx-2" />

            {/* Rating Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-500 text-sm py-2">Độ tuổi:</span>
              {allRatings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedRating === rating
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black'
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  {rating === 'Tất cả' ? rating : getRatingDescription(rating)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Tìm thấy <span className="text-yellow-500 font-semibold">{filteredMovies.length}</span> phim
          </p>
          {(searchQuery || selectedGenre !== 'Tất cả' || selectedRating !== 'Tất cả') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Tất cả');
                setSelectedRating('Tất cả');
              }}
              className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy phim</h3>
            <p className="text-gray-400">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 mb-3">
                  {/* Poster */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
                    hoveredMovie === movie.id ? 'opacity-100' : 'opacity-0'
                  }`} />

                  {/* Rating Badge */}
                  <div className={`absolute top-3 left-3 ${getRatingColor(movie.rating)} px-2 py-1 rounded text-xs font-bold text-white`}>
                    {movie.rating}
                  </div>

                  {/* Score Badge */}
                  {movie.tomatometer > 0 && (
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-white text-xs font-semibold">{movie.tomatometer}%</span>
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {new Date(movie.releaseDate) > new Date() && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-white text-xs font-semibold">
                          🎬 {new Date(movie.releaseDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hover Content */}
                  <div className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300 ${
                    hoveredMovie === movie.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genre.slice(0, 2).map((g) => (
                        <span key={g} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                          {g}
                        </span>
                      ))}
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-lg text-sm hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105">
                      MUA VÉ
                    </button>
                  </div>

                  {/* Play Icon */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredMovie === movie.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}>
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-yellow-500 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-gray-500 text-xs">{movie.duration}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Poster */}
                  <div className="relative w-full md:w-48 aspect-[2/3] md:aspect-auto md:h-64 flex-shrink-0">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 left-3 ${getRatingColor(movie.rating)} px-2 py-1 rounded text-xs font-bold text-white`}>
                      {movie.rating}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                          {movie.title}
                        </h3>
                        {movie.tomatometer > 0 && (
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-yellow-500">
                                <span>🍅</span>
                                <span className="font-bold">{movie.tomatometer}%</span>
                              </div>
                              <p className="text-[10px] text-gray-500">Tomatometer</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-yellow-500">
                                <span>⭐</span>
                                <span className="font-bold">{movie.userRating}%</span>
                              </div>
                              <p className="text-[10px] text-gray-500">Audience</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {movie.duration}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span>•</span>
                        <span>🎬 {movie.director}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genre.map((g) => (
                          <span key={g} className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                            {g}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-2">{movie.synopsis}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105">
                        🎟️ MUA VÉ NGAY
                      </button>
                      <button className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all border border-gray-700">
                        ▶ Xem Trailer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredMovies.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-full border border-gray-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
              Xem thêm phim
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 border border-gray-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-4 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium mb-4">
                ✨ Ưu đãi đặc biệt
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trở thành thành viên <span className="text-yellow-500">VIP</span>
              </h2>
              <p className="text-gray-400 mb-6 max-w-xl">
                Đăng ký thành viên VIP ngay hôm nay để nhận được những ưu đãi độc quyền: giảm 20% mọi vé phim, 
                bỏng nước miễn phí, và nhiều đặc quyền hấp dẫn khác!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-full hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25">
                  Đăng ký ngay
                </button>
                <button className="px-8 py-3 bg-transparent border border-gray-600 text-white font-medium rounded-full hover:border-white transition-all">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            {/* VIP Card Preview */}
            <div className="flex-shrink-0">
              <div className="w-72 h-44 bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-400 rounded-2xl p-6 shadow-2xl shadow-yellow-500/30 transform rotate-3 hover:rotate-0 transition-transform">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-black/60 text-xs font-medium">CINEPRO</p>
                    <p className="text-black font-bold text-xl">VIP MEMBER</p>
                  </div>
                  <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👑</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-black/60 text-xs">Cardholder</p>
                    <p className="text-black font-semibold">YOUR NAME</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black/60 text-xs">Points</p>
                    <p className="text-black font-bold">∞</p>
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
