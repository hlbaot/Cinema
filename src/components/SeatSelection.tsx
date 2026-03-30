import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Info, Ticket, Clock, MapPin, Calendar, Sparkles, Zap } from 'lucide-react';
import { Movie, Showtime, Cinema, Seat } from '../types';

interface SeatSelectionProps {
  movie: Movie;
  showtime: Showtime;
  cinema: Cinema;
  onContinue: (seats: Seat[]) => void;
  onBack: () => void;
}

// Generate seats with realistic cinema layout
const generateSeats = (): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const seats: Seat[] = [];
  
  rows.forEach((row) => {
    // Couple seats only in last row
    if (row === 'K') {
      for (let i = 1; i <= 8; i++) {
        const isOccupied = Math.random() < 0.25;
        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type: 'couple',
          status: isOccupied ? 'occupied' : 'available',
          price: 200000
        });
      }
    } else {
      const seatsInRow = row === 'A' ? 10 : 12;
      const startSeat = row === 'A' ? 2 : 1;
      
      for (let i = startSeat; i <= seatsInRow + startSeat - 1; i++) {
        let type: Seat['type'] = 'standard';
        let price = 90000;
        
        // VIP rows (center rows)
        if (['E', 'F', 'G'].includes(row)) {
          type = 'vip';
          price = 120000;
        }
        
        // Wheelchair spots
        if (row === 'A' && (i === 2 || i === 11)) {
          type = 'wheelchair';
          price = 70000;
        }
        
        const isOccupied = Math.random() < 0.3;
        
        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status: isOccupied ? 'occupied' : 'available',
          price
        });
      }
    }
  });
  
  return seats;
};

export default function SeatSelection({
  movie,
  showtime,
  cinema,
  onContinue,
  onBack
}: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setSeats(generateSeats());
    // Entrance animation
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    // For couple seats, select/deselect pairs
    if (seat.type === 'couple') {
      const pairNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
      const pairSeat = seats.find(s => s.row === seat.row && s.number === pairNumber);
      
      if (pairSeat && pairSeat.status !== 'occupied') {
        const isSelected = seat.status === 'selected';
        
        setSeats(prev => prev.map(s => {
          if (s.id === seat.id || s.id === pairSeat.id) {
            return { ...s, status: isSelected ? 'available' : 'selected' };
          }
          return s;
        }));

        setSelectedSeats(prev => {
          if (isSelected) {
            return prev.filter(s => s.id !== seat.id && s.id !== pairSeat.id);
          }
          return [...prev, { ...seat, status: 'selected' }, { ...pairSeat, status: 'selected' }];
        });
      }
      return;
    }

    setSeats(prev => prev.map(s => {
      if (s.id === seat.id) {
        return {
          ...s,
          status: s.status === 'selected' ? 'available' : 'selected'
        };
      }
      return s;
    }));

    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, { ...seat, status: 'selected' }];
    });
  };

  const totalPrice = useMemo(() => 
    selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  , [selectedSeats]);

  const getSeatStyle = (seat: Seat) => {
    const baseStyle = 'transition-all duration-200 transform';
    
    if (seat.status === 'occupied') {
      return `${baseStyle} bg-zinc-800 cursor-not-allowed opacity-40`;
    }
    
    if (seat.status === 'selected') {
      return `${baseStyle} bg-gradient-to-b from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105`;
    }
    
    switch (seat.type) {
      case 'vip':
        return `${baseStyle} bg-gradient-to-b from-amber-600/40 to-amber-700/30 border-2 border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/50 hover:scale-105 cursor-pointer`;
      case 'couple':
        return `${baseStyle} bg-gradient-to-b from-pink-600/40 to-pink-700/30 border-2 border-pink-500/50 hover:border-pink-400 hover:bg-pink-500/50 hover:scale-105 cursor-pointer`;
      case 'wheelchair':
        return `${baseStyle} bg-gradient-to-b from-blue-600/40 to-blue-700/30 border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/50 hover:scale-105 cursor-pointer`;
      default:
        return `${baseStyle} bg-zinc-800/80 border border-zinc-600 hover:border-zinc-400 hover:bg-zinc-700 hover:scale-105 cursor-pointer`;
    }
  };

  // Group seats by row
  const seatsByRow = useMemo(() => {
    const grouped: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    // Sort seats in each row by number
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => a.number - b.number);
    });
    return grouped;
  }, [seats]);

  const rowOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[
            { step: 1, label: 'Chọn ghế', icon: Ticket },
            { step: 2, label: 'Thanh toán', icon: Zap },
            { step: 3, label: 'Hoàn tất', icon: Sparkles }
          ].map((item, i) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                i === 0 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' 
                  : 'bg-zinc-800/50 text-gray-500'
              }`}>
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold">{item.label}</span>
                <span className="sm:hidden text-sm font-bold">{item.step}</span>
              </div>
              {i < 2 && (
                <div className="w-8 sm:w-12 h-0.5 bg-zinc-800">
                  <div className={`h-full ${i === 0 ? 'bg-yellow-500 w-1/2' : 'bg-transparent'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className={`bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 rounded-3xl border border-zinc-800 p-4 sm:p-8 backdrop-blur-xl transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              
              {/* Screen */}
              <div className="relative mb-16">
                <div className="relative">
                  {/* Screen glow effect */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-cyan-500/20 to-transparent blur-xl" />
                  
                  {/* Screen shape */}
                  <div className="relative mx-auto w-[90%] perspective-1000">
                    <div className="h-3 bg-gradient-to-b from-cyan-400 via-white to-cyan-400 rounded-t-[100%] shadow-lg shadow-cyan-500/50 transform rotateX-10" />
                    <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                  </div>
                  
                  {/* Screen label */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium tracking-wider">MÀN HÌNH</span>
                  </div>
                </div>
              </div>

              {/* Seats Grid */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 px-2">
                {rowOrder.map((row, rowIndex) => {
                  const rowSeats = seatsByRow[row] || [];
                  const isVipRow = ['E', 'F', 'G'].includes(row);
                  const isCoupleRow = row === 'K';
                  
                  return (
                    <div 
                      key={row} 
                      className={`flex items-center gap-2 sm:gap-3 ${
                        isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                      }`}
                      style={{ transitionDelay: `${rowIndex * 50}ms`, transition: 'all 0.4s ease-out' }}
                    >
                      {/* Row Label Left */}
                      <span className={`w-6 sm:w-8 text-center text-sm font-bold ${
                        isVipRow ? 'text-amber-400' : isCoupleRow ? 'text-pink-400' : 'text-gray-500'
                      }`}>
                        {row}
                      </span>
                      
                      {/* Seats */}
                      <div className={`flex gap-1 sm:gap-1.5 ${isCoupleRow ? 'gap-3 sm:gap-4' : ''}`}>
                        {rowSeats.map((seat, seatIndex) => {
                          const isCouple = seat.type === 'couple';
                          const isLeftCouple = isCouple && seat.number % 2 === 1;
                          const isRightCouple = isCouple && seat.number % 2 === 0;
                          
                          // Add aisle gap in middle
                          const hasAisleGap = !isCoupleRow && seatIndex === Math.floor(rowSeats.length / 2) - 1;
                          
                          return (
                            <div key={seat.id} className={`${hasAisleGap ? 'mr-4 sm:mr-6' : ''}`}>
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.status === 'occupied'}
                                className={`
                                  ${isCouple ? 'w-10 sm:w-14' : 'w-7 sm:w-9'} 
                                  h-7 sm:h-9
                                  rounded-t-lg
                                  text-xs
                                  font-semibold
                                  ${getSeatStyle(seat)}
                                  ${isLeftCouple ? 'rounded-bl-lg rounded-tr-none border-r-0' : ''}
                                  ${isRightCouple ? 'rounded-br-lg rounded-tl-none border-l-0' : ''}
                                `}
                                title={`${seat.id} - ${seat.type === 'vip' ? 'VIP' : seat.type === 'couple' ? 'Couple' : seat.type === 'wheelchair' ? 'Wheelchair' : 'Thường'} - ${seat.price.toLocaleString()}đ`}
                              >
                                {seat.number}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Row Label Right */}
                      <span className={`w-6 sm:w-8 text-center text-sm font-bold ${
                        isVipRow ? 'text-amber-400' : isCoupleRow ? 'text-pink-400' : 'text-gray-500'
                      }`}>
                        {row}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-10 pt-6 border-t border-zinc-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { color: 'bg-zinc-800 border-zinc-600', label: 'Thường', price: '90.000đ' },
                    { color: 'bg-amber-600/40 border-amber-500/50', label: 'VIP', price: '120.000đ' },
                    { color: 'bg-pink-600/40 border-pink-500/50', label: 'Couple', price: '200.000đ' },
                    { color: 'bg-blue-600/40 border-blue-500/50', label: 'Wheelchair', price: '70.000đ' },
                    { color: 'bg-gradient-to-b from-yellow-400 to-yellow-500', label: 'Đang chọn', price: '' },
                    { color: 'bg-zinc-800 opacity-40', label: 'Đã đặt', price: '' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-t-lg border ${item.color}`} />
                      <div>
                        <span className="text-gray-300 text-sm">{item.label}</span>
                        {item.price && (
                          <span className="text-gray-500 text-xs block">{item.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200/80 text-sm">
                  Ghế VIP nằm ở hàng E, F, G với góc nhìn tốt nhất. Ghế Couple dành cho 2 người, nằm ở hàng cuối cùng.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 rounded-3xl border border-zinc-800 overflow-hidden backdrop-blur-xl">
                {/* Movie Info Header */}
                <div className="relative p-4 border-b border-zinc-800 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <img src={movie.banner} alt="" className="w-full h-full object-cover blur-sm" />
                  </div>
                  <div className="relative flex gap-4">
                    <div className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/10 shadow-xl">
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 mb-2">{movie.title}</h3>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                            showtime.format === 'IMAX' ? 'bg-blue-500/20 text-blue-400' :
                            showtime.format === 'Gold Class' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-zinc-700 text-gray-300'
                          }`}>
                            {showtime.format}
                          </span>
                          <span className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-xs rounded">
                            {movie.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-4 space-y-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400">Rạp:</span>
                    <span className="text-white font-medium truncate">{cinema.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400">Ngày:</span>
                    <span className="text-white font-medium">{showtime.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400">Suất:</span>
                    <span className="text-white font-medium">{showtime.time}</span>
                  </div>
                </div>

                {/* Selected Seats */}
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Ghế đã chọn</span>
                    <span className="text-white font-medium">{selectedSeats.length} ghế</span>
                  </div>
                  
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <span 
                          key={seat.id}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            seat.type === 'vip' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            seat.type === 'couple' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                            seat.type === 'wheelchair' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-zinc-700 text-white border border-zinc-600'
                          }`}
                        >
                          {seat.id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Chưa chọn ghế nào</p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="p-4 space-y-3 border-b border-zinc-800">
                  {selectedSeats.length > 0 && (
                    <>
                      <div className="space-y-2">
                        {Object.entries(
                          selectedSeats.reduce((acc, seat) => {
                            const type = seat.type === 'vip' ? 'VIP' : 
                                        seat.type === 'couple' ? 'Couple' : 
                                        seat.type === 'wheelchair' ? 'Wheelchair' : 'Thường';
                            if (!acc[type]) acc[type] = { count: 0, price: seat.price };
                            acc[type].count++;
                            return acc;
                          }, {} as { [key: string]: { count: number; price: number } })
                        ).map(([type, data]) => (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Ghế {type} x{data.count}</span>
                            <span className="text-white">{(data.count * data.price).toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                      <div className="h-px bg-zinc-800" />
                    </>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-yellow-400">
                        {totalPrice.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => selectedSeats.length > 0 && onContinue(selectedSeats)}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                      selectedSeats.length > 0
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
                        : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Tiếp tục thanh toán</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={onBack}
                    className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại chọn suất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
