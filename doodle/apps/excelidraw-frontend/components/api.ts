import axios from "axios";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:3001", // Use environment variable or fallback
  headers: {
    "Content-Type": "application/json",
  },
});



// Add a response interceptor to handle common errors

export default api;
