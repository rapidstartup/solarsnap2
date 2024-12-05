// API configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
export const SOLAR_API_BASE_URL = 'https://solar.googleapis.com/v1';

// Map configuration
export const DEFAULT_MAP_ZOOM = 19;
export const DEFAULT_MAP_TILT = 0;
export const DEFAULT_LAYER_RADIUS = 50; // meters
export const DEFAULT_LAYER_OPACITY = 0.8;