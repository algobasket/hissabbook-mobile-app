import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor (required for APK build)
  output: 'export',
  
  // Base path for serving under /mobile route
  // When deployed, the app will be served at https://hissabbook.com/mobile
  basePath: process.env.NODE_ENV === 'production' ? '/mobile' : '',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for static export
  trailingSlash: true,
};

export default nextConfig;
