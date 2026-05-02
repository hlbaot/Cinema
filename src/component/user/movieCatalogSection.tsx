"use client";

import { useState } from "react";

import MovieFilterSection, {
  ALL_GENRE_LABEL,
  type MovieSortKey,
  type MovieTabKey,
  type MovieViewMode,
} from "@/src/component/user/movieFilterSection";
import MovieListSection from "@/src/component/user/movieListSection";

export default function MovieCatalogSection() {
  const [activeTab, setActiveTab] = useState<MovieTabKey>("showing");
  const [viewMode, setViewMode] = useState<MovieViewMode>("grid");
  const [sortBy, setSortBy] = useState<MovieSortKey>("newest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([ALL_GENRE_LABEL]);
  const [selectedRating, setSelectedRating] = useState(ALL_GENRE_LABEL);

  return (
    <>
      <MovieFilterSection
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        selectedGenres={selectedGenres}
        onSelectedGenresChange={setSelectedGenres}
        selectedRating={selectedRating}
        onSelectedRatingChange={setSelectedRating}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <MovieListSection
        activeTab={activeTab}
        viewMode={viewMode}
        sortBy={sortBy}
        selectedGenres={selectedGenres}
        selectedRating={selectedRating}
      />
    </>
  );
}
