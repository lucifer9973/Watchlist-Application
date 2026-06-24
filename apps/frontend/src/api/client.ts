import axios from "axios";

const apiUrl = import.meta.env?.VITE_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});
