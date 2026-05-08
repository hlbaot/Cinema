export function getMovieDetailHref(movieId: number, hash?: string) {
  const basePath = `/phim/${movieId}`

  return hash ? `${basePath}#${hash}` : basePath
}
