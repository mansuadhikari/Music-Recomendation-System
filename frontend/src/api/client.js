import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getSongs = () => apiClient.get("/songs/");

export const getRecommendations = (songId, topN = 5) =>
    apiClient.get(`/songs/${songId}/recommend`, { params: { top_n: topN } });

export const searchSongs = (query) =>
    apiClient.get("/songs/search", { params: { q: query } });

export default apiClient;