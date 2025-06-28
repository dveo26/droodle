// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === "development";

export const HTTP_BACKEND = isDevelopment
  ? "http://localhost:3001"
  : "https://droodle.onrender.com";

export const WS_URL = isDevelopment
  ? "ws://localhost:8080"
  : "wss://droodle-ws.onrender.com";
