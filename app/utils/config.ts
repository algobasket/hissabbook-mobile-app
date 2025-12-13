/**
 * Configuration utility for environment detection and API base URL
 */

/**
 * Get the API base URL based on the environment
 * - Development: Uses localhost:5000 (backend API)
 * - Production: Uses https://hissabbook.com (backend API)
 */
export function getApiBaseUrl(): string {
  // Check if we're in a Capacitor app (native mobile app)
  const isCapacitor = typeof window !== "undefined" && 
    (window as any).Capacitor !== undefined;

  // Check if we're in development mode
  const isDevelopment = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname === "127.0.0.1");

  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }

  // In Capacitor app (native), use production API
  if (isCapacitor) {
    return "https://hissabbook.com";
  }

  // In development (web browser), use localhost
  if (isDevelopment) {
    return "http://localhost:5000";
  }

  // Default to production
  return "https://hissabbook.com";
}

/**
 * Get the app base URL (for navigation and assets)
 * - Development: http://localhost:3002
 * - Production: https://hissabbook.com/mobile
 */
export function getAppBaseUrl(): string {
  const isDevelopment = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname === "127.0.0.1");

  if (isDevelopment) {
    return "http://localhost:3002";
  }

  return "https://hissabbook.com/mobile";
}

/**
 * Check if we're running in a Capacitor app (native mobile)
 */
export function isCapacitorApp(): boolean {
  return typeof window !== "undefined" && 
    (window as any).Capacitor !== undefined;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname === "127.0.0.1");
}

