import axios from "axios";

const BASE_URL = "https://api.watchmode.com/v1";
const API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY; // Access the API key from Vite's environment variables

// Function to fetch releases (upcoming or recently released movies/TV shows)
export const fetchReleases = async (type = 'movies') => {
  try {
    const response = await axios.get(`${BASE_URL}/releases/`, {
      params: {
        apiKey: API_KEY,
        type: type, // 'movies' or 'tv'
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log('Releases Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching releases:', error);
    throw error;
  }
};


export const fetchSearchResults = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/autocomplete-search/`, {
      params: {
        apiKey: API_KEY,
        search_value: query,     // The search query typed by the user
        search_type: 2,          // Default to 2 (titles only, or set to 1 for both titles and people)
        page_size: 10,           // Limit the number of results
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export const fetchTitleDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${id}/details/`, {
      params: { apiKey: API_KEY },
    });
    return response.data;
  } catch (error) {
      console.error("Error fetching title details:", error);
    throw error;
  }
};