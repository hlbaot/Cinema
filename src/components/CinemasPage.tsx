import { useState } from 'react';
import { MapPin, Phone, Star, Filter, X, Navigation } from 'lucide-react';
import { Cinema } from '../types';

interface CinemasPageProps {
  cinemas: Cinema[];
  onSelectCinema: (cinema: Cinema) => void;
}

export default function CinemasPage({ cinemas, onSelectCinema }: CinemasPageProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allFeatures = ['IMAX', 'Dolby Atmos', 'Gold Class', '4DX', 'ScreenX', '2D', '3D', 'Premium'];

  const filteredCinemas = selectedFeatures.length > 0
    ? cinemas.filter(cinema => 
        selectedFeatures.some(f => cinema.features.includes(f))
      )
    : cinemas;

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Hệ thống rạp</h1>
            <p className="text-gray-400 mt-1">Tìm rạp chiếu phim gần bạn</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            {selectedFeatures.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                {selectedFeatures.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            fixed inset-0 z-50 bg-black/90 backdrop-blur p-6 transform transition-transform sm:relative sm:inset-auto sm:bg-transparent sm:p-0 sm:transform-none sm:w-64 sm:flex-shrink-0
            ${showFilters ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          `}>
            <div className="flex items-center justify-between mb-6 sm:hidden">
              <h2 className="text-xl font-bold text-white">Bộ lọc</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-4 sticky top-24">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Loại rạp
              </h3>
              <div className="space-y-2">
                {allFeatures.map(feature => (
                  <label
                    key={feature}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 bg-transparent"
                    />
                    <span className={`text-sm ${
                      selectedFeatures.includes(feature) ? 'text-yellow-400' : 'text-gray-300'
                    } group-hover:text-white transition-colors`}>
                      {feature}
                    </span>
                  </label>
                ))}
              </div>

              {selectedFeatures.length > 0 && (
                <button
                  onClick={() => setSelectedFeatures([])}
                  className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* Cinema List & Map */}
          <div className="flex-1">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Cinema Cards */}
              <div className="space-y-4">
                {filteredCinemas.map(cinema => (
                  <div
                    key={cinema.id}
                    onClick={() => setSelectedCinema(cinema)}
                    className={`p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border transition-all cursor-pointer hover:border-yellow-500/50 ${
                      selectedCinema?.id === cinema.id 
                        ? 'border-yellow-500' 
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={cinema.image} 
                          alt={cinema.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{cinema.name}</h3>
                        <p className="text-gray-400 text-sm mb-2 flex items-start gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{cinema.address}</span>
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">{cinema.hotline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {cinema.features.map(feature => (
                        <span
                          key={feature}
                          className={`px-2 py-1 text-xs rounded-full ${
                            feature === 'IMAX' ? 'bg-blue-500/20 text-blue-400' :
                            feature === 'Dolby Atmos' ? 'bg-purple-500/20 text-purple-400' :
                            feature === 'Gold Class' ? 'bg-yellow-500/20 text-yellow-400' :
                            feature === '4DX' ? 'bg-pink-500/20 text-pink-400' :
                            'bg-white/10 text-gray-400'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCinema(cinema);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-colors"
                      >
                        Xem lịch chiếu
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <Navigation className="w-5 h-5 text-blue-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredCinemas.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Không tìm thấy rạp phù hợp</p>
                    <button
                      onClick={() => setSelectedFeatures([])}
                      className="mt-2 text-yellow-400 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
                <div className="h-full bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden relative">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#grid)" className="text-white" />
                    </svg>
                  </div>

                  {/* Map Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6">
                    <MapPin className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Bản đồ</h3>
                    <p className="text-gray-400 text-center mb-4">
                      {selectedCinema ? selectedCinema.name : 'Chọn một rạp để xem vị trí'}
                    </p>

                    {selectedCinema && (
                      <div className="p-4 bg-black/50 rounded-xl border border-white/10 w-full max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-white font-medium">{selectedCinema.name}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{selectedCinema.address}</p>
                        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>4.8</span>
                          <span className="text-gray-600">•</span>
                          <span>2.5km từ vị trí của bạn</span>
                        </div>
                      </div>
                    )}

                    {/* Simulated markers */}
                    <div className="absolute inset-0 pointer-events-none">
                      {cinemas.map((cinema, i) => (
                        <div
                          key={cinema.id}
                          className={`absolute transition-all ${
                            selectedCinema?.id === cinema.id ? 'scale-125 z-10' : ''
                          }`}
                          style={{
                            top: `${20 + (i * 15)}%`,
                            left: `${30 + (i * 12)}%`,
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                            selectedCinema?.id === cinema.id 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}>
                            <MapPin className="w-5 h-5 text-white" fill="currentColor" />
                          </div>
                        </div>
                      ))}
                    </div>
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
