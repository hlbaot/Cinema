export type FeedbackItem = {
  id: number;
  name: string;
  location: string;
  movieTitle: string;
  rating: number;
  comment: string;
};

export const feedbackData: FeedbackItem[] = [
  {
    id: 1,
    name: "Ngoc Anh",
    location: "Da Nang",
    movieTitle: "Avatar: The Way of Water",
    rating: 5,
    comment: "Hinh anh rat da mat, xem tren man hinh lon cuc ky cuon. Phan dat ve tren CinePro cung de dung va nhanh.",
  },
  {
    id: 2,
    name: "Minh Quan",
    location: "Ho Chi Minh",
    movieTitle: "Marvel Avenger Infinity War",
    rating: 5,
    comment: "Phim nhieu phan canh hoanh trang, nhip nhanh va rat cuon. Minh thich cach lich chieu hien thi ro rang de chon suat.",
  },
  {
    id: 3,
    name: "Thanh Truc",
    location: "Can Tho",
    movieTitle: "Nguoi nhen",
    rating: 4,
    comment: "Noi dung de theo doi, canh hanh dong on ap va vui. Trailer va poster tren web nhin rat bat mat.",
  },
  {
    id: 4,
    name: "Bao Han",
    location: "Hue",
    movieTitle: "Tho Oi",
    rating: 4,
    comment: "Phim co mau sac rieng va tao cam giac gan gui. Minh vao trang la tim duoc phim ngay, trai nghiem kha muot.",
  },
  {
    id: 5,
    name: "Gia Huy",
    location: "Ha Noi",
    movieTitle: "Avatar: The Way of Water",
    rating: 5,
    comment: "Khong gian am thanh va hinh anh cua phim rat da. Phan giao dien toi mau den vang nhin cung hop chat phim.",
  },
  {
    id: 6,
    name: "Kim Oanh",
    location: "Bien Hoa",
    movieTitle: "Marvel Avenger Infinity War",
    rating: 4,
    comment: "Dat ve nhanh, thao tac gon. Phim xem lai van hay, dac biet la nhung doan cao trao va dan nhan vat rat an tuong.",
  },
];
