import { useState, useEffect } from "react";
import { API_GetMovieDetail } from "@/src/api/API_Movie";
import { MappedMovie } from "./useMovies";

interface MappedMovieDetail extends MappedMovie {
  director: string;
  actors: string[];
  showtimes: {
    date: string;
    rooms: {
      room_id: string;
      room_name: string;
      format: string;
      sessions: {
        id: string;
        time: string;
      }[];
    }[];
  }[];
}

const statusMap: Record<string, string> = {
  NOW_SHOWING: "Đang chiếu",
  COMING_SOON: "Sắp ra mắt",
  ENDED: "Đã kết thúc",
};

export function useMovieDetail(id: string | undefined) {
  const [movie, setMovie] = useState<MappedMovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await API_GetMovieDetail(id);
        if (response.success) {
          const m = response.data;
          const mapped: MappedMovieDetail = {
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
            director: m.director,
            actors: m.actor,
            showtimes: m.showtimes?.map(s => ({
              date: s.date,
              rooms: s.rooms.map(r => ({
                room_id: r.room_id,
                room_name: r.room_name,
                format: r.format,
                sessions: r.sessions.map(sess => ({
                  id: sess.id,
                  time: sess.time || sess.start_time || ""
                }))
              }))
            })) || []
          };
          setMovie(mapped);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch movie detail:", err);
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải chi tiết phim");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { movie, loading, error };
}
