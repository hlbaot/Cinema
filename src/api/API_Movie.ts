import axios from "axios";
import type { MovieResponse, DetailMovieResponse } from "@/src/interface/movie";
import { API_URL } from "./url";

export interface MovieGenresResponse {
    success: boolean;
    data: Array<{
        id: string;
        name: string;
    }>;
}

export type MovieGenresRawResponse = Array<{
    id: string;
    name: string;
}>;

export interface MovieAgeRatingItem {
    value: string;
    label: string;
    description: string;
}

export interface MovieAgeRatingResponse {
    success: boolean;
    data: MovieAgeRatingItem[];
}

export type MovieAgeRatingRawResponse = MovieAgeRatingItem[];

export interface MovieStatusItem {
    value: string;
    label: string;
    description: string;
}

export interface MovieStatusResponse {
    success: boolean;
    data: MovieStatusItem[];
}

export type MovieStatusRawResponse = MovieStatusItem[];

export interface CreateMoviePayload {
    title: string;
    description: string;
    duration_minutes: number;
    genre: string[];
    status: "NOW_SHOWING" | "COMING_SOON" | "ENDED";
    age_rating: string;
    poster_url: string;
    trailer_url: string;
    director: string;
    actor: string[];
    start_date: string;
    end_date: string;
    expected_hot_score?: number;
    admin_priority?: number;
}

export interface UpdateMoviePayload {
    title?: string;
    description?: string;
    duration_minutes?: number;
    genre?: string[];
    status?: "NOW_SHOWING" | "COMING_SOON" | "ENDED";
    age_rating?: string;
    poster_url?: string;
    trailer_url?: string;
    director?: string;
    actors?: string[];
    start_date?: string;
    end_date?: string;
    expected_hot_score?: number;
    admin_priority?: number;
}

export const API_GetAllMovies = async (): Promise<MovieResponse> => {
    const res = await axios.get<MovieResponse>(
        `${API_URL}/api/v1/movies`
    );
    return res.data;
};

export const API_GetMovieGenres = async (): Promise<MovieGenresResponse | MovieGenresRawResponse> => {
    const res = await axios.get<MovieGenresResponse | MovieGenresRawResponse>(
        `${API_URL}/api/v1/movies/genre`
    );
    return res.data;
};

export const API_GetMovieAgeRatings = async (): Promise<MovieAgeRatingResponse | MovieAgeRatingRawResponse> => {
    const res = await axios.get<MovieAgeRatingResponse | MovieAgeRatingRawResponse>(
        `${API_URL}/api/v1/movies/age-rating`
    );
    return res.data;
};

export const API_GetMovieStatuses = async (): Promise<MovieStatusResponse | MovieStatusRawResponse> => {
    const res = await axios.get<MovieStatusResponse | MovieStatusRawResponse>(
        `${API_URL}/api/v1/movies/status`
    );
    return res.data;
};

export const API_CreateMovie = async (payload: CreateMoviePayload) => {
    const res = await axios.post(
        `${API_URL}/api/v1/movies`,
        payload
    );
    return res.data;
};

export const API_UpdateMovie = async (movieId: string, payload: UpdateMoviePayload) => {
    const res = await axios.patch(
        `${API_URL}/api/v1/movies/${movieId}`,
        payload
    );
    return res.data;
};

export const API_DeleteMovie = async (movieId: string) => {
    const res = await axios.delete(
        `${API_URL}/api/v1/movies/${movieId}`
    );
    return res.data;
};

export const API_GetMovieDetail = async (id: string): Promise<DetailMovieResponse> => {
    const res = await axios.get<DetailMovieResponse>(
        `${API_URL}/api/v1/movies/${id}`
    );
    return res.data;
};
