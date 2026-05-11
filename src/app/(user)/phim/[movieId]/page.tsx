import ModalDetailMovide from "@/src/component/user/modalDetailMovide";

type MovieDetailPageProps = {
  params: Promise<{
    movieId: string;
  }>;
};

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { movieId } = await params;

  return <ModalDetailMovide movieId={movieId} />;
}
