export type FeaturedMovie = {
  cast: string[];
  description: string;
  duration: string;
  genres: string[];
  id: string;
  poster: string;
  posterLabel: string;
  rating: string;
  synopsis: string;
  title: string;
  trailerUrl: string;
  year: string;
};

export type ShowingMovie = {
  ageRating: string;
  description: string;
  genre: string;
  id: string;
  poster: string;
  posterAccent: string;
  posterBackdrop: string;
  showtimes: string[];
  synopsis: string;
  title: string;
  trailerUrl: string;
  year: string;
};

export type ReviewItem = {
  avatar: string;
  cinema: string;
  id: string;
  movie: string;
  name: string;
  rating: number;
  review: string;
};

export type ComingSoonMovie = {
  accent: string;
  genre: string;
  id: string;
  poster: string;
  releaseDate: string;
  title: string;
};

export const featuredMovies: FeaturedMovie[] = [
  {
    id: "eclipse-code",
    title: "Eclipse Code",
    year: "2026",
    rating: "T16",
    duration: "2h 14m",
    genres: ["Sci-fi", "Thriller", "IMAX"],
    cast: ["Minh Tu", "Lena Dao", "Jules Park"],
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    posterLabel: "Neon Protocol",
    description:
      "Mot diem cham giua AI, am muu va nhung cuon phim do bong len man hinh cong chieu cuc dai.",
    synopsis:
      "Khi mot doan ma bi mat duoc phat hien ben trong he thong chieu phim toan cau, mot ky su hinh anh buoc phai truy tim su that truoc khi moi ky uc bi viet lai.",
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
  {
    id: "golden-velvet",
    title: "Golden Velvet",
    year: "2026",
    rating: "T13",
    duration: "1h 58m",
    genres: ["Drama", "Romance", "Dolby Atmos"],
    cast: ["Thao Nhi", "Huy Tran", "Ari Kim"],
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    posterLabel: "Velvet Nights",
    description:
      "Mot ban tinh ca xa hoa, noi moi khung hinh deu duoc thap sang nhu dem cong chieu dau tien.",
    synopsis:
      "Giua Sai Gon hoa le, mot nha soan nhac va mot minh tinh noi tieng dung giua lua chon giua danh vong va cam xuc that.",
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
  {
    id: "last-reel",
    title: "The Last Reel",
    year: "2026",
    rating: "K",
    duration: "2h 05m",
    genres: ["Adventure", "Family", "4DX"],
    cast: ["Gia Bao", "Nina Vu", "David Lam"],
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80",
    posterLabel: "Final Journey",
    description:
      "Cuoc phieu luu dien anh mac ao modern blockbuster, day nang luong va nhung truong doan choang ngop.",
    synopsis:
      "Ba nguoi ban tinh co mo cua mot rap co xua, noi moi cuon phim deu mo ra mot canh cua den ky niem va hanh trinh moi.",
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
];

export const nowShowingMovies: ShowingMovie[] = [
  {
    id: "echo-nova",
    title: "Echo Nova",
    year: "2026",
    ageRating: "T16",
    genre: "Sci-fi • Action",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
    posterAccent: "from-fuchsia-500 via-red-500 to-orange-400",
    posterBackdrop: "from-slate-950 via-[#28103c] to-[#602749]",
    synopsis:
      "Doan phi hanh gia mang ve mot tan song la lam thay doi tri nho va du bao tuong lai.",
    description:
      "Hanh dong toc do cao, dai canh choang ngop va am thanh Dolby Atmos rung chuyen tung khung hinh.",
    showtimes: ["09:30", "13:20", "18:10", "21:40"],
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
  {
    id: "midnight-opera",
    title: "Midnight Opera",
    year: "2026",
    ageRating: "T13",
    genre: "Drama • Mystery",
    poster: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80",
    posterAccent: "from-yellow-300 via-amber-400 to-red-500",
    posterBackdrop: "from-[#120b19] via-[#35203b] to-[#6a2435]",
    synopsis:
      "Mot nha hat dong cua bat ngo sang den luc nua dem, keo theo nhung giai dieu va bi mat bi chon vui.",
    description:
      "Ton vinh nganh nghe trinh dien bang visual sang trong, doc dao va day tinh dien anh.",
    showtimes: ["10:10", "14:00", "17:50", "20:55"],
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
  {
    id: "carbon-city",
    title: "Carbon City",
    year: "2026",
    ageRating: "T18",
    genre: "Crime • Thriller",
    poster: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=80",
    posterAccent: "from-cyan-300 via-sky-400 to-blue-600",
    posterBackdrop: "from-[#071421] via-[#0b2f47] to-[#155b7a]",
    synopsis:
      "Mot thanh pho khong ngu bi chi phoi boi mang luoi camera va mot sat nhan khong de lai dau vet.",
    description:
      "Nhip do cang thang, card phim sang bong va rat hop voi khan gia yeu phong cach noir hien dai.",
    showtimes: ["08:45", "12:15", "16:25", "22:05"],
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
  {
    id: "amber-shore",
    title: "Amber Shore",
    year: "2026",
    ageRating: "K",
    genre: "Romance • Adventure",
    poster: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
    posterAccent: "from-orange-300 via-amber-400 to-rose-500",
    posterBackdrop: "from-[#21100b] via-[#7c3f18] to-[#d97706]",
    synopsis:
      "Hai ke xa la cung gap nhau trong mot hanh trinh ngoai bien, noi hoi am cua mat troi va ky uc cu va cham.",
    description:
      "Dai canh dep, tone mau nong va cam xuc de xem cuoi tuan cung gia dinh hoac cap doi.",
    showtimes: ["11:00", "15:10", "19:05", "23:00"],
    trailerUrl: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
  },
];

export const reviews: ReviewItem[] = [
  {
    id: "review-1",
    name: "Khanh Linh",
    avatar: "KL",
    movie: "Echo Nova",
    cinema: "CINEPRO Landmark 81",
    rating: 5,
    review:
      "Khong gian rap rat sang, ghe ngoi em va trailer mo dau qua da. Phan am thanh trong phong IMAX rat an tuong.",
  },
  {
    id: "review-2",
    name: "Nguyen Duy",
    avatar: "ND",
    movie: "Midnight Opera",
    cinema: "CINEPRO Thu Duc",
    rating: 4,
    review:
      "Dat ve nhanh, giao dien de thao tac. Modal thong tin phim ro rang, de xem lich chieu va trailer.",
  },
  {
    id: "review-3",
    name: "Mai Anh",
    avatar: "MA",
    movie: "Amber Shore",
    cinema: "CINEPRO Phu Nhuan",
    rating: 5,
    review:
      "Phong cach web rat premium, xem tren dien thoai van muot. Khu review nhin rat co concept va de doc.",
  },
];

export const comingSoonMovies: ComingSoonMovie[] = [
  {
    id: "silent-horizon",
    title: "Silent Horizon",
    genre: "Epic • IMAX",
    releaseDate: "Khoi chieu 28.04.2026",
    accent: "from-slate-400/50 via-slate-300/30 to-white/10",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "red-archive",
    title: "Red Archive",
    genre: "Action • Spy",
    releaseDate: "Khoi chieu 03.05.2026",
    accent: "from-red-500/55 via-rose-400/20 to-black/10",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
  },
];
