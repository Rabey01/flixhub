import axios from "axios";

// Base URL for the API
const BASE_URL = "https://imdb-com.p.rapidapi.com";

// Function to fetch trending movies or TV shows
export const fetchTrending = async (type) => {
  try {
    const response = await axios.get(`${BASE_URL}/trending/${type}`, {
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "example-imdb-api-host",
      },
    });
    return response.data.items; // Adjust based on API response
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
};

// Function to fetch 2024 movies or TV shows
export const fetchLatest = async (type) => {
  try {
    const response = await axios.get(`${BASE_URL}/latest/${type}`, {
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "imdb-com.p.rapidapi.com",
      },
    });
    return response.data.items; // Adjust based on API response
  } catch (error) {
    console.error(`Error fetching latest ${type}:`, error);
    return [];
  }
};
