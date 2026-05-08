import { notFound } from "next/navigation";

import ModalDetailMovide from "@/src/component/user/modalDetailMovide";
import { dataMovie } from "@/src/data/movie";

type MovieDetailPageProps = {
  params: Promise<{
    movieId: string;
  }>;
};

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { movieId } = await params;
  const parsedMovieId = Number(movieId);

  if (!Number.isInteger(parsedMovieId) || !dataMovie.some((movie) => movie.id === parsedMovieId)) {
    notFound();
  }

  return <ModalDetailMovide movieId={parsedMovieId} />;
}
