import type { NextConfig } from "next";

// Check if we're building for static export (APK) or server mode (web deployment)
const isStaticExport = process.env.STATIC_EXPORT === 'true';

// Base path for serving under /mobile route
// When deployed, the app will be served at https://hissabbook.com/mobile
const basePathValue = process.env.NODE_ENV === 'production' && !isStaticExport ? '/mobile' : '';

const nextConfig: NextConfig = {
  // Static export only for APK builds, not for web deployment
  ...(isStaticExport ? { output: 'export' } : {}),
  
  basePath: basePathValue,
  
  // Disable image optimization for static export, enable for server mode
  images: {
    unoptimized: isStaticExport,
  },
  
  // Trailing slash for static export
  ...(isStaticExport ? { trailingSlash: true } : {}),
};

export default nextConfig;
