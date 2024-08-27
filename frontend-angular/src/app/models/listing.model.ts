export interface Listing {
    id: string;
    name: string;
    description: string;
    neighborhood_overview: string;
    picture_url: string;
    host_name: string;
    host_about: string;
    host_picture_url: string;
    neighbourhood_cleansed: string;
    latitude: number;
    longitude: number;
    room_type: string;
    amenities: string[];
    price: number;
    minimum_nights: number;
    maximum_nights: number;
    number_of_reviews: number;
    number_of_reviews_l30d: number;
    review_scores_rating: number;
    review_scores_cleanliness: number;
    review_scores_checkin: number;
    review_scores_communication: number;
    review_scores_location: number;
}