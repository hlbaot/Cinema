"use client";

import { dataMovie } from "@/src/data/movie";

export type MovieTabKey = "showing" | "coming";
export type MovieViewMode = "grid" | "list";
export type MovieSortKey = "newest" | "rating" | "name";

export const ALL_GENRE_LABEL = "T\u1ea5t c\u1ea3";

const movieTabs: Array<{ key: MovieTabKey; label: string }> = [
  { key: "showing", label: "\ud83c\udfac \u0110ang Chi\u1ebfu" },
  { key: "coming", label: "\ud83c\udf9e\ufe0f S\u1eafp Chi\u1ebfu" },
];

const sortOptions: Array<{ value: MovieSortKey; label: string }> = [
  { value: "newest", label: "M\u1edbi nh\u1ea5t" },
  { value: "rating", label: "\u0110\u00e1nh gi\u00e1 cao" },
  { value: "name", label: "T\u00ean A-Z" },
];

const basePrimaryGenres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Drama",
];

const baseExtraGenres = ["Horror", "Musical", "Romance", "Sci-Fi", "Thriller", "History"];
const ageRatings = [ALL_GENRE_LABEL, "Ph\u1ed5 bi\u1ebfn", "13+", "16+", "18+"];

const mergedGenres = Array.from(
  new Set([...basePrimaryGenres, ...baseExtraGenres, ...dataMovie.flatMap((movie) => movie.genres)]),
);

const primaryGenres = [ALL_GENRE_LABEL, ...mergedGenres.slice(0, 7)];
const extraGenres = mergedGenres.slice(7);

function GridIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`m-0.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "border border-yellow-200/20 bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-[0_10px_24px_rgba(245,158,11,0.16)] hover:-translate-y-0.5 hover:brightness-105"
          : "border border-gray-700 bg-gray-800/60 text-gray-400 hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
      }`}
    >
      {label}
    </button>
  );
}

function toggleGenres(label: string, current: string[]) {
  if (label === ALL_GENRE_LABEL) {
    return [ALL_GENRE_LABEL];
  }

  const selectedWithoutAll = current.filter((item) => item !== ALL_GENRE_LABEL);

  if (selectedWithoutAll.includes(label)) {
    const next = selectedWithoutAll.filter((item) => item !== label);
    return next.length > 0 ? next : [ALL_GENRE_LABEL];
  }

  return [...selectedWithoutAll, label];
}

type MovieFilterSectionProps = {
  activeTab: MovieTabKey;
  onActiveTabChange: (tab: MovieTabKey) => void;
  selectedGenres: string[];
  onSelectedGenresChange: (genres: string[]) => void;
  selectedRating: string;
  onSelectedRatingChange: (rating: string) => void;
  viewMode: MovieViewMode;
  onViewModeChange: (mode: MovieViewMode) => void;
  sortBy: MovieSortKey;
  onSortByChange: (sort: MovieSortKey) => void;
};

export default function MovieFilterSection({
  activeTab,
  onActiveTabChange,
  selectedGenres,
  onSelectedGenresChange,
  selectedRating,
  onSelectedRatingChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
}: MovieFilterSectionProps) {
  const hasExtraGenreSelected = selectedGenres.some((genre) => extraGenres.includes(genre));

  return (
    <section className="w-full bg-black py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-full border border-gray-800 bg-gray-900/80 p-1 backdrop-blur-sm">
            {movieTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onActiveTabChange(tab.key)}
                className={`rounded-full px-6 py-2.5 font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                onViewModeChange(viewMode === "grid" ? "list" : "grid")
              }
              className="group flex rounded-lg border border-gray-800 bg-gray-900/80 p-1 backdrop-blur-sm transition-all duration-300 hover:border-gray-700"
              aria-label={
                viewMode === "grid" ? "Switch to list view" : "Switch to grid view"
              }
            >
              <span
                className={`rounded-md p-2 transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-yellow-500 text-black"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                <GridIcon />
              </span>
              <span
                className={`rounded-md p-2 transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-yellow-500 text-black"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                <ListIcon />
              </span>
            </button>

            <select
              aria-label="Sort movies"
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as MovieSortKey)}
              className="cursor-pointer rounded-lg border border-gray-800 bg-gray-900/80 px-4 py-2 text-white backdrop-blur-sm transition-all duration-300 focus:border-yellow-500 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-neutral-950">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="py-2 text-sm text-gray-500">{"Th\u1ec3 lo\u1ea1i:"}</span>

            {primaryGenres.map((genre) => (
              <PillButton
                key={genre}
                label={genre}
                active={selectedGenres.includes(genre)}
                onClick={() =>
                  onSelectedGenresChange(toggleGenres(genre, selectedGenres))
                }
              />
            ))}

            {extraGenres.length > 0 && (
              <div className="group relative">
                <button
                  type="button"
                  className={`m-0.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                    hasExtraGenreSelected
                      ? "border border-yellow-200/20 bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-[0_10px_24px_rgba(245,158,11,0.16)] hover:-translate-y-0.5 hover:brightness-105"
                      : "border border-gray-700 bg-gray-800/60 text-gray-400 hover:-translate-y-0.5 hover:bg-gray-700 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                  }`}
                >
                  {"Th\u00eam +"}
                </button>

                <div className="invisible absolute left-0 top-full z-50 mt-2 flex min-w-[150px] flex-col gap-1 rounded-xl border border-gray-800 bg-gray-900 p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {extraGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() =>
                        onSelectedGenresChange(toggleGenres(genre, selectedGenres))
                      }
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedGenres.includes(genre)
                          ? "border border-yellow-200/15 bg-yellow-500/10 text-yellow-300 shadow-[0_6px_18px_rgba(245,158,11,0.08)]"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-2 hidden h-8 w-px self-center bg-gray-800 md:block" />

          <div className="flex flex-wrap gap-2">
            <span className="py-2 text-sm text-gray-500">{"\u0110\u1ed9 tu\u1ed5i:"}</span>

            {ageRatings.map((rating) => (
              <PillButton
                key={rating}
                label={rating}
                active={selectedRating === rating}
                onClick={() => onSelectedRatingChange(rating)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
