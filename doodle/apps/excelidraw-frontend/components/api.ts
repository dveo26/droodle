import axios from "axios";
import { HTTP_BACKEND } from "@/config";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: HTTP_BACKEND, // Use environment variable or fallback
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle common errors

export default api;
