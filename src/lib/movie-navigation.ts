export function getMovieDetailHref(movieId: string | number, hash?: string) {
  const basePath = `/phim/${movieId}`

  return hash ? `${basePath}#${hash}` : basePath
}
