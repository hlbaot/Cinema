import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { MovieAgeRating, MovieStatus } from "src/movie/enums/movie.enum";

export class CreateMovieDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    duration_minutes: number;

    @IsArray()
    @IsString({each: true})
    @IsNotEmpty()
    genre: string[]

    @IsEnum(MovieStatus)
    @IsNotEmpty()
    status: MovieStatus

    @IsEnum(MovieAgeRating)
    @IsNotEmpty()
    age_rating: MovieAgeRating

    @IsString()
    @IsNotEmpty()
    poster_url: string

    @IsString()
    @IsNotEmpty()
    trailer_url: string

    @IsString()
    @IsNotEmpty()
    director: string

    @IsArray()
    @IsString({each: true})
    @IsNotEmpty()
    actor: string[]

    @IsDateString()
    @IsNotEmpty()
    start_date: Date;

    @IsDateString()
    @IsNotEmpty()
    end_date: Date

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    expected_hot_score?: number;

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    admin_priority?: number;
}
