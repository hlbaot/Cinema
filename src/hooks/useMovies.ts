import { useState, useEffect } from "react";
import { API_GetAllMovies } from "@/src/api/API_Movie";
import type { Movie as APIMovie, MappedMovie } from "@/src/interface/movie";

export type { MappedMovie }

const statusMap: Record<string, string> = {
  NOW_SHOWING: "Đang chiếu",
  COMING_SOON: "Sắp ra mắt",
  ENDED: "Đã kết thúc",
};

export function useMovies() {
  const [movies, setMovies] = useState<MappedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await API_GetAllMovies();
        if (response.success) {
          const mapped: MappedMovie[] = response.data.movies.map((m: APIMovie) => ({
            id: m.id,
            title: m.title,
            age_rating: m.age_rating,
            trailer: m.trailer_url,
            poster: m.poster_url,
            description: m.description || "",
            minutes: m.duration_minutes,
            status: statusMap[m.status] || m.status,
            score: m.score || 0,
            genres: m.genre,
          }));
          setMovies(mapped);
        } else {
            setError(response.data.message || "Lấy danh sách phim thất bại");
        }
      } catch (err: unknown) {
        console.error("Failed to fetch movies:", err);
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải phim");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { movies, loading, error };
}
