// Environment-based backend URL
// In production (npm run build), uses Vercel backend
// In development (npm run dev), uses localhost
export const BASE_URL = import.meta.env.PROD 
  ? 'https://major-project-eta-seven.vercel.app'  // Production - Vercel backend
  : 'http://localhost:4518';                       // Development - Local backend

// Alternative: Render backend
// ? 'https://major-project-r7g6.onrender.com'     