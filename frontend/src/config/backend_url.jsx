// Auto-detect: Use production URL if deployed, localhost if in development
export const BASE_URL = import.meta.env.PROD 
  ? 'https://major-project-r7g6.onrender.com'  // Production
  : 'http://localhost:4518';                    // Development

// Alternative Render URLs (if needed):
// export const BASE_URL = 'https://cpms-api.vercel.app';