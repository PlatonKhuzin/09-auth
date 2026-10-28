import axios from "axios";
const origin =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
const baseURL = origin.replace(/\/$/, "") + "/api";
export const api = axios.create({ baseURL, withCredentials: true });
