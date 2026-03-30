import { Movie, Cinema, Showtime, Booking, User, Seat } from '../types';

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "DUNE: PART TWO",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: "166 phút",
    rating: "C16",
    releaseDate: "2024-03-01",
    director: "Denis Villeneuve",
    synopsis: "Paul Atreides hợp nhất với Chani và người Fremen trong khi trên con đường trả thù những kẻ đã hủy hoại gia đình anh. Đối mặt với sự lựa chọn giữa tình yêu của đời mình và số phận của vũ trụ, anh phải ngăn chặn một tương lai khủng khiếp mà chỉ mình anh có thể nhìn thấy.",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&h=800&fit=crop",
    tomatometer: 93,
    userRating: 95,
    actors: [
      { id: 1, name: "Timothée Chalamet", role: "Paul Atreides", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
      { id: 2, name: "Zendaya", role: "Chani", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
      { id: 3, name: "Rebecca Ferguson", role: "Lady Jessica", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
      { id: 4, name: "Josh Brolin", role: "Gurney Halleck", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
      { id: 5, name: "Austin Butler", role: "Feyd-Rautha", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    ]
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
    actors: [
      { id: 6, name: "Cillian Murphy", role: "J. Robert Oppenheimer", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
      { id: 7, name: "Emily Blunt", role: "Kitty Oppenheimer", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
    ]
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
  }
];

export const mockCinemas: Cinema[] = [
  {
    id: 1,
    name: "CINEPRO Landmark 81",
    address: "Tầng 5, Landmark 81, 720A Điện Biên Phủ, Q. Bình Thạnh, TP.HCM",
    hotline: "1900 6969",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    features: ["IMAX", "Dolby Atmos", "Gold Class", "4DX"],
    lat: 10.7944,
    lng: 106.7215
  },
  {
    id: 2,
    name: "CINEPRO Central Premium",
    address: "Tầng 6, Takashimaya, 92-94 Nam Kỳ Khởi Nghĩa, Q.1, TP.HCM",
    hotline: "1900 6868",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop",
    features: ["Gold Class", "Dolby Atmos", "ScreenX"],
    lat: 10.7731,
    lng: 106.7004
  },
  {
    id: 3,
    name: "CINEPRO Aeon Mall",
    address: "Tầng 3, Aeon Mall Tân Phú, 30 Bờ Bao Tân Thắng, Q. Tân Phú, TP.HCM",
    hotline: "1900 6767",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&h=400&fit=crop",
    features: ["IMAX", "2D", "3D"],
    lat: 10.8018,
    lng: 106.6180
  },
  {
    id: 4,
    name: "CINEPRO Thảo Điền",
    address: "Tầng 4, Estella Place, 88 Song Hành, Q.2, TP.HCM",
    hotline: "1900 6565",
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&h=400&fit=crop",
    features: ["Gold Class", "Dolby Atmos", "Premium"],
    lat: 10.8031,
    lng: 106.7557
  }
];

export const mockShowtimes: Showtime[] = [
  { id: 1, cinemaId: 1, cinemaName: "CINEPRO Landmark 81", format: "IMAX", time: "10:30", date: "2024-03-15", status: "available", price: 150000 },
  { id: 2, cinemaId: 1, cinemaName: "CINEPRO Landmark 81", format: "IMAX", time: "13:45", date: "2024-03-15", status: "filling", price: 150000 },
  { id: 3, cinemaId: 1, cinemaName: "CINEPRO Landmark 81", format: "Gold Class", time: "16:00", date: "2024-03-15", status: "available", price: 250000 },
  { id: 4, cinemaId: 1, cinemaName: "CINEPRO Landmark 81", format: "2D", time: "19:15", date: "2024-03-15", status: "soldout", price: 90000 },
  { id: 5, cinemaId: 1, cinemaName: "CINEPRO Landmark 81", format: "IMAX", time: "21:30", date: "2024-03-15", status: "available", price: 150000 },
  { id: 6, cinemaId: 2, cinemaName: "CINEPRO Central Premium", format: "Gold Class", time: "11:00", date: "2024-03-15", status: "available", price: 280000 },
  { id: 7, cinemaId: 2, cinemaName: "CINEPRO Central Premium", format: "Gold Class", time: "14:30", date: "2024-03-15", status: "filling", price: 280000 },
  { id: 8, cinemaId: 2, cinemaName: "CINEPRO Central Premium", format: "2D", time: "17:45", date: "2024-03-15", status: "available", price: 95000 },
  { id: 9, cinemaId: 3, cinemaName: "CINEPRO Aeon Mall", format: "IMAX", time: "09:00", date: "2024-03-15", status: "available", price: 140000 },
  { id: 10, cinemaId: 3, cinemaName: "CINEPRO Aeon Mall", format: "3D", time: "12:15", date: "2024-03-15", status: "available", price: 110000 },
  { id: 11, cinemaId: 3, cinemaName: "CINEPRO Aeon Mall", format: "2D", time: "15:30", date: "2024-03-15", status: "filling", price: 85000 },
  { id: 12, cinemaId: 3, cinemaName: "CINEPRO Aeon Mall", format: "IMAX", time: "20:00", date: "2024-03-15", status: "available", price: 140000 },
];

export const generateSeats = (): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const seats: Seat[] = [];
  
  rows.forEach((row) => {
    const seatsInRow = row === 'K' ? 8 : 12;
    for (let i = 1; i <= seatsInRow; i++) {
      let type: Seat['type'] = 'standard';
      let price = 90000;
      
      if (row === 'K') {
        type = 'couple';
        price = 200000;
      } else if (['E', 'F', 'G'].includes(row)) {
        type = 'vip';
        price = 120000;
      } else if (row === 'A' && (i === 1 || i === 12)) {
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
  });
  
  return seats;
};

export const mockUser: User = {
  id: 1,
  name: "Nguyễn Văn Anh",
  email: "nguyenvananh@email.com",
  phone: "0901 234 567",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  membershipLevel: "VIP",
  points: 12500,
  totalSpent: 5680000
};

export const mockBookings: Booking[] = [
  {
    id: "BK001",
    movie: mockMovies[0],
    cinema: mockCinemas[0],
    showtime: mockShowtimes[0],
    seats: [
      { id: "F5", row: "F", number: 5, type: "vip", status: "selected", price: 120000 },
      { id: "F6", row: "F", number: 6, type: "vip", status: "selected", price: 120000 }
    ],
    totalPrice: 240000,
    paymentMethod: "MoMo",
    status: "confirmed",
    qrCode: "CINEPRO-BK001-DUNE2-F5F6",
    bookedAt: "2024-03-14T10:30:00",
    customerId: 1,
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@gmail.com",
    customerPhone: "0901234567",
    approvedBy: "Staff Minh",
    approvedAt: "2024-03-14T10:35:00"
  },
  {
    id: "BK002",
    movie: mockMovies[1],
    cinema: mockCinemas[1],
    showtime: mockShowtimes[6],
    seats: [
      { id: "E7", row: "E", number: 7, type: "vip", status: "selected", price: 120000 },
    ],
    totalPrice: 120000,
    paymentMethod: "Credit Card",
    status: "completed",
    qrCode: "CINEPRO-BK002-OPPENHEIMER-E7",
    bookedAt: "2024-02-20T15:00:00",
    customerId: 1,
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@gmail.com",
    customerPhone: "0901234567",
    approvedBy: "Staff Lan",
    approvedAt: "2024-02-20T15:05:00",
    checkedInBy: "Staff Hùng",
    checkedInAt: "2024-02-20T18:45:00"
  },
  {
    id: "BK003",
    movie: mockMovies[2],
    cinema: mockCinemas[0],
    showtime: mockShowtimes[2],
    seats: [
      { id: "D3", row: "D", number: 3, type: "standard", status: "selected", price: 90000 },
      { id: "D4", row: "D", number: 4, type: "standard", status: "selected", price: 90000 }
    ],
    totalPrice: 180000,
    paymentMethod: "ZaloPay",
    status: "pending",
    qrCode: "CINEPRO-BK003-KUNGFU4-D3D4",
    bookedAt: "2024-03-15T08:20:00",
    customerId: 2,
    customerName: "Trần Thị B",
    customerEmail: "tranthib@gmail.com",
    customerPhone: "0912345678"
  },
  {
    id: "BK004",
    movie: mockMovies[0],
    cinema: mockCinemas[1],
    showtime: mockShowtimes[1],
    seats: [
      { id: "G8", row: "G", number: 8, type: "couple", status: "selected", price: 200000 },
      { id: "G9", row: "G", number: 9, type: "couple", status: "selected", price: 200000 }
    ],
    totalPrice: 400000,
    paymentMethod: "Credit Card",
    status: "pending",
    qrCode: "CINEPRO-BK004-DUNE2-G8G9",
    bookedAt: "2024-03-15T09:15:00",
    customerId: 3,
    customerName: "Lê Văn C",
    customerEmail: "levanc@gmail.com",
    customerPhone: "0923456789"
  },
  {
    id: "BK005",
    movie: mockMovies[3],
    cinema: mockCinemas[2],
    showtime: mockShowtimes[4],
    seats: [
      { id: "E5", row: "E", number: 5, type: "vip", status: "selected", price: 150000 }
    ],
    totalPrice: 150000,
    paymentMethod: "MoMo",
    status: "rejected",
    qrCode: "CINEPRO-BK005-GODZILLA-E5",
    bookedAt: "2024-03-14T20:00:00",
    customerId: 4,
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@gmail.com",
    customerPhone: "0934567890",
    rejectedBy: "Staff Minh",
    rejectedAt: "2024-03-14T20:30:00",
    rejectionReason: "Thanh toán không thành công"
  }
];
