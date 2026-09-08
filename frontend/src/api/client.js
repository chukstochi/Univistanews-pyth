import axios from "axios";

// In dev, Vite proxies "/api" to the local Flask server (see vite.config.js).
// In production the frontend (S3/CloudFront) and backend (Elastic Beanstalk)
// are on different hosts, so set VITE_API_BASE_URL in a ".env.production"
// file, e.g. VITE_API_BASE_URL=https://api.yourdomain.com/api
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("univista_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("univista_token");
      localStorage.removeItem("univista_user");
    }
    return Promise.reject(err);
  }
);

export default client;
