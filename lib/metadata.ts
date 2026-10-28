export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://notehub.com"),
);
