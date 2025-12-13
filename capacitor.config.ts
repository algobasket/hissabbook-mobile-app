import { CapacitorConfig } from '@capacitor/cli';

// Determine if we're building for development or production
// When building APK, we want production mode (load from live server)
// For local testing, set CAPACITOR_ENV=development
const isDevelopment = process.env.CAPACITOR_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.hissabbook.mobile',
  appName: 'HissabBook',
  webDir: 'out', // Use static export output for Capacitor
  server: {
    androidScheme: 'https',
    // For development: load from localhost
    // For production: load from production server
    ...(isDevelopment ? {
      url: 'http://localhost:3002',
      cleartext: true
    } : {
      url: 'https://hissabbook.com/mobile',
      cleartext: false
    })
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#10B981',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#10B981',
    },
  },
};

export default config;

