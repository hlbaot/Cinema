export type Movie = {
    id: number;
    title: string;
    age_rating: string;
    trailer: string;
    poster: string;
    description: string;
    minutes: number;
    status: "Đang chiếu" | "Sắp ra mắt";
    score: number;
    genres: string[];
};

export const dataMovie: Movie[] = [
    {
        id: 1,
        title: "Avatar: The Way of Water",
        age_rating: "18+",
        trailer: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776174182/ava_rllsed.mp4",
        poster: "https://res.cloudinary.com/dvduetdmu/image/upload/v1776214181/avatar2_h8c7w7.jpg",
        description: "Jake Sully sống cùng gia đình mới của mình trên mặt trăng Pandora ngoài hệ Mặt Trời. Khi một mối đe dọa quen thuộc quay trở lại để hoàn thành những gì đã bắt đầu trước đó, Jake phải hợp tác với Neytiri và quân đội của tộc Na'vi để bảo vệ quê hương của họ.",
        minutes: 192,
        status: "Đang chiếu",
        score: 94,
        genres: ["Sci-Fi", "Adventure"],
    },
    {
        id: 2,
        title: "Marvel Avenger Infinity War",
        age_rating: "18+",
        trailer: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776180742/Marvel_Studios_Avengers__Infinity_War_Official_Trailer_1080p_svxh5z.mp4",
        poster: "https://res.cloudinary.com/dvduetdmu/image/upload/v1776414371/Avengers-Infinity_War-Official-Poster_qyrapg.jpg",
        description: "Cuộc Chiến Vô Cực - Avengers: Infinity War 2018: Sau chuyến hành trình độc nhất vô nhị không ngừng mở rộng và phát triển vũ trụ điện ảnh Marvel, bộ phim Avengers: Cuộc Chiến Vô Cực sẽ mang đến màn ảnh trận chiến cuối cùng khốc liệt nhất mọi thời đại. Biệt đội Avengers và các đồng minh siêu anh hùng của họ phải chấp nhận hy sinh tất cả để có thể chống lại kẻ thù hùng mạnh Thanos trước tham vọng hủy diệt toàn bộ vũ trụ của hắn.",
        minutes: 149,
        status: "Sắp ra mắt",
        score: 96,
        genres: ["Action", "Sci-Fi"],
    },
    {
        id: 3,
        title: "Người nhện",
        age_rating: "18+",
        trailer: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776180738/NGU%CC%9BO%CC%9B%CC%80I_NHE%CC%A3%CC%82N__KHO%CC%9B%CC%89I_%C4%90A%CC%82%CC%80U_MO%CC%9B%CC%81I_TRAILER_-_Du%CC%9B%CC%A3_kie%CC%82%CC%81n_kho%CC%9B%CC%89i_chie%CC%82%CC%81u__31.07.2026_1080p_ywbhwj.mp4",
        poster: "https://res.cloudinary.com/dvduetdmu/image/upload/v1776415115/The_Amazing_Spider-Man_2012_VN_poster_qgyibt.jpg",
        description: "Người Nhện (Spider-Man) là một bộ phim siêu anh hùng nổi tiếng được ra mắt vào năm 2002, đánh dấu bước đầu tiên trong loạt phim về siêu anh hùng nổi tiếng này. Phim kể về câu chuyện của cậu thiếu niên Peter Parker, người sau khi bị nhện biến đổi gen cắn đã nhận được siêu năng lực đặc biệt. Ban đầu, Peter là một cậu học sinh nhút nhát và bị bạn bè trêu chọc.",
        minutes: 121,
        status: "Sắp ra mắt",
        score: 89,
        genres: ["Action", "Adventure"],
    },
    
    {
        id: 4,
        title: "Thỏ Ơi",
        age_rating: "18+",
        trailer: "https://res.cloudinary.com/dvduetdmu/video/upload/v1776180678/THO%CC%89_O%CC%9BI_-_First_Look_Trailer___Du%CC%9B%CC%A3_kie%CC%82%CC%81n_kho%CC%9B%CC%89i_chie%CC%82%CC%81u_MU%CC%80NG_1_TE%CC%82%CC%81T_2026_720p_t6btcf.mp4",
        poster: "https://res.cloudinary.com/dvduetdmu/image/upload/v1776415524/images_nniucn.jpg",
        description: "Với tâm thế luôn mang đến những điều mới để cho khán giả của mình không nhàm chán, Thỏ Ơi!! - bộ phim điện ảnh thứ 4 của đạo diễn Trấn Thành hứa hẹn sẽ mang đến một màu sắc hoàn toàn khác biệt.",
        minutes: 127,
        status: "Đang chiếu",
        score: 87,
        genres: ["Comedy", "Drama"],
    }
];
