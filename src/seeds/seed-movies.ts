import 'dotenv/config';
import 'reflect-metadata';
import appDataSource from 'src/config/database.config';
import { Movie } from 'src/movie/entities/movie.entity';
import { MovieAgeRating, MovieStatus } from 'src/movie/enums/movie.enum';
import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';

type MovieSeed = Omit<
  Partial<Movie>,
  'id' | 'created_at' | 'updated_at' | 'movie_genres' | 'movie_casts' | 'reviews' | 'showtimes'
> & {
  title: string;
  duration_minutes: number;
};

const today = new Date();
const dateFromNow = (days: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const movies: MovieSeed[] = [
  {
    title: 'Avengers: Endgame',
    description:
      'Sau cú búng tay của Thanos, các Avengers còn sống sót tập hợp cho một nỗ lực cuối cùng để khôi phục vũ trụ.',
    duration_minutes: 181,
    poster_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    director: 'Anthony Russo, Joe Russo',
    start_date: dateFromNow(-21),
    end_date: dateFromNow(30),
    age_rating: MovieAgeRating.T13,
    audience_score: 9.1,
    admin_priority: 10,
    expected_hot_score: 96,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D, ScreeningFormat.IMAX],
  },
  {
    title: 'Dune: Part Two',
    description:
      'Paul Atreides liên minh với người Fremen trong hành trình trả thù và chấp nhận định mệnh trên hành tinh Arrakis.',
    duration_minutes: 166,
    poster_url: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    director: 'Denis Villeneuve',
    start_date: dateFromNow(-14),
    end_date: dateFromNow(35),
    age_rating: MovieAgeRating.T13,
    audience_score: 8.8,
    admin_priority: 9,
    expected_hot_score: 92,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.IMAX, ScreeningFormat.VIP],
  },
  {
    title: 'Inside Out 2',
    description:
      'Riley bước vào tuổi thiếu niên, kéo theo những cảm xúc mới xuất hiện trong trung tâm điều khiển.',
    duration_minutes: 96,
    poster_url: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    director: 'Kelsey Mann',
    start_date: dateFromNow(-10),
    end_date: dateFromNow(40),
    age_rating: MovieAgeRating.P,
    audience_score: 8.5,
    admin_priority: 9,
    expected_hot_score: 90,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D],
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    description:
      'Godzilla và Kong đối mặt với hiểm họa khổng lồ mới đang đe dọa cân bằng của cả hai thế giới.',
    duration_minutes: 115,
    poster_url: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=lV1OOlGwExM',
    director: 'Adam Wingard',
    start_date: dateFromNow(-7),
    end_date: dateFromNow(28),
    age_rating: MovieAgeRating.T13,
    audience_score: 7.4,
    admin_priority: 8,
    expected_hot_score: 82,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D, ScreeningFormat.FOUR_DX],
  },
  {
    title: 'Kung Fu Panda 4',
    description:
      'Po chuẩn bị trở thành Thủ lĩnh Tinh thần của Thung lũng Bình Yên và đối đầu với một phù thủy biến hình.',
    duration_minutes: 94,
    poster_url: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    director: 'Mike Mitchell',
    start_date: dateFromNow(-12),
    end_date: dateFromNow(25),
    age_rating: MovieAgeRating.P,
    audience_score: 7.8,
    admin_priority: 8,
    expected_hot_score: 80,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D],
  },
  {
    title: 'Deadpool & Wolverine',
    description:
      'Deadpool bị kéo vào một nhiệm vụ hỗn loạn cùng Wolverine, mở ra chuyến phiêu lưu đa vũ trụ đầy châm biếm.',
    duration_minutes: 128,
    poster_url: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=73_1biulkYk',
    director: 'Shawn Levy',
    start_date: dateFromNow(5),
    end_date: dateFromNow(55),
    age_rating: MovieAgeRating.T18,
    audience_score: 8.2,
    admin_priority: 10,
    expected_hot_score: 95,
    status: MovieStatus.COMING_SOON,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.IMAX, ScreeningFormat.FOUR_DX],
  },
  {
    title: 'Moana 2',
    description:
      'Moana nhận được lời gọi từ tổ tiên và lên đường tới những vùng biển xa xôi chưa từng được khám phá.',
    duration_minutes: 100,
    poster_url: 'https://image.tmdb.org/t/p/w500/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
    director: 'David Derrick Jr.',
    start_date: dateFromNow(18),
    end_date: dateFromNow(70),
    age_rating: MovieAgeRating.P,
    audience_score: 8.0,
    admin_priority: 9,
    expected_hot_score: 88,
    status: MovieStatus.COMING_SOON,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D],
  },
  {
    title: 'Joker: Folie a Deux',
    description:
      'Arthur Fleck tiếp tục hành trình u tối khi mối quan hệ mới khiến ranh giới giữa sân khấu và thực tại tan biến.',
    duration_minutes: 138,
    poster_url: 'https://image.tmdb.org/t/p/w500/aciP8Km0waTLXEYf5ybFK5CSUxl.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=xy8aJw1vYHo',
    director: 'Todd Phillips',
    start_date: dateFromNow(25),
    end_date: dateFromNow(75),
    age_rating: MovieAgeRating.T18,
    audience_score: 7.5,
    admin_priority: 8,
    expected_hot_score: 84,
    status: MovieStatus.COMING_SOON,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.VIP],
  },
  {
    title: 'Interstellar',
    description:
      'Một nhóm phi hành gia đi qua hố sâu vũ trụ để tìm nơi sinh tồn mới cho nhân loại.',
    duration_minutes: 169,
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    director: 'Christopher Nolan',
    start_date: dateFromNow(-60),
    end_date: dateFromNow(-5),
    age_rating: MovieAgeRating.T13,
    audience_score: 9.2,
    admin_priority: 7,
    expected_hot_score: 76,
    status: MovieStatus.ENDED,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.IMAX],
  },
  {
    title: 'Spider-Man: No Way Home',
    description:
      'Danh tính Spider-Man bị tiết lộ, Peter Parker tìm đến Doctor Strange và vô tình mở ra rạn nứt đa vũ trụ.',
    duration_minutes: 148,
    poster_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    director: 'Jon Watts',
    start_date: dateFromNow(-45),
    end_date: dateFromNow(15),
    age_rating: MovieAgeRating.T13,
    audience_score: 8.7,
    admin_priority: 8,
    expected_hot_score: 86,
    status: MovieStatus.NOW_SHOWING,
    supported_formats: [ScreeningFormat.TWO_D, ScreeningFormat.THREE_D, ScreeningFormat.IMAX],
  },
];

async function seedMovies() {
  await appDataSource.initialize();
  const movieRepository = appDataSource.getRepository(Movie);

  let created = 0;
  let updated = 0;

  for (const seed of movies) {
    const existing = await movieRepository.findOne({ where: { title: seed.title } });
    if (existing) {
      movieRepository.merge(existing, seed);
      await movieRepository.save(existing);
      updated += 1;
      continue;
    }

    await movieRepository.save(movieRepository.create(seed));
    created += 1;
  }

  await appDataSource.destroy();
  console.log(`Seed movies completed. Created: ${created}, updated: ${updated}.`);
}

seedMovies().catch(async (error) => {
  console.error('Seed movies failed:', error);
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.exit(1);
});
