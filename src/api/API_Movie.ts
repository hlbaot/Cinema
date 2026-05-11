import axios from "axios";
import { MovieResponse, DetailMovieResponse } from "@/src/interface/movie";
import { API_URL } from "./url";

export const API_GetAllMovies = async (): Promise<MovieResponse> => {
    const res = await axios.get<MovieResponse>(
        `${API_URL}/api/v1/movies`
    );
    return res.data;
};

export const API_GetMovieDetail = async (id: string): Promise<DetailMovieResponse> => {
    const res = await axios.get<DetailMovieResponse>(
        `${API_URL}/api/v1/movies/${id}`
    );
    return res.data;
};
