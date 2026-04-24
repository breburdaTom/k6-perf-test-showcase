export interface RegisterUserResponse {
  id: number;
  username: string;
}

export interface LoginResponse {
  token: string;
}

export interface PizzaRecommendationResponse {
  calories: number;
  pizza: {
    id: number;
    ingredients: Array<{
      id: number;
      name: string;
      vegetarian: boolean;
    }>;
    name: string;
    tool: string;
  };
  vegetarian: boolean;
}

export interface Rating {
  id: number;
  pizza_id: number;
  stars: number;
}

export interface RatingsResponse {
  ratings: Rating[];
}

export interface CreateRatingRequest {
  pizza_id: number;
  stars: number;
}
