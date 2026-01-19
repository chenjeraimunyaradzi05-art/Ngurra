/**
 * Expo App Configuration for Ngurra Pathways
 * 
 * This configuration supports:
 * - EAS Build and Submit
 * - Deep linking and universal links
 * - Push notifications
 * - App Store and Play Store metadata
 */

export default ({ config }) => ({
  ...config,
  name: 'Ngurra Pathways',
  slug: 'ngurra-pathways',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  
  // Splash screen configuration
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F172A',
  },
  
  // Asset bundling
  assetBundlePatterns: [
    '**/*',
  ],
  
  // iOS-specific configuration
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ngurrapathways.app',
    buildNumber: '1',
    
    // App Store metadata
    config: {
      usesNonExemptEncryption: false,
    },
    
    // Info.plist additions
    infoPlist: {
      // Privacy permission descriptions
      NSCameraUsageDescription: 'Allow Ngurra Pathways to access your camera to take photos for your profile or resume.',
      NSPhotoLibraryUsageDescription: 'Allow Ngurra Pathways to access your photos to upload profile pictures or documents.',
      NSFaceIDUsageDescription: 'Use Face ID for quick and secure login to your Ngurra Pathways account.',
      NSLocationWhenInUseUsageDescription: 'Allow Ngurra Pathways to access your location to find nearby jobs and events.',
      
      // Background modes
      UIBackgroundModes: [
        'remote-notification',
        'fetch',
      ],
      
      // Accessibility
      UIAccessibilityTraits: 'UIAccessibilityTraitAllowsDirectInteraction',
    },
    
    // Universal links - Apple App Site Association
    associatedDomains: [
      'applinks:ngurrapathways.com.au',
      'applinks:www.ngurrapathways.com.au',
    ],
    
    // Push notifications
    entitlements: {
      'aps-environment': 'production',
    },
  },
  
  // Android-specific configuration
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F172A',
    },
    package: 'com.ngurrapathways.app',
    versionCode: 1,
    
    // Permissions
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
    ],
    
    // Intent filters for deep linking
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'ngurrapathways.com.au',
            pathPrefix: '/jobs',
          },
          {
            scheme: 'https',
            host: 'ngurrapathways.com.au',
            pathPrefix: '/courses',
          },
          {
            scheme: 'https',
            host: 'ngurrapathways.com.au',
            pathPrefix: '/mentors',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'ngurra',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    
    // Google Services for FCM
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
  },
  
  // Web configuration (for Expo web if needed)
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  
  // Expo plugins
  plugins: [
    // Notifications
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#3B82F6',
        sounds: ['./assets/sounds/notification.wav'],
      },
    ],
    
    // Document picker
    'expo-document-picker',
    
    // Local authentication (biometrics)
    'expo-local-authentication',
    
    // Secure storage
    'expo-secure-store',
    
    // Background fetch
    'expo-background-fetch',
    
    // Task manager
    'expo-task-manager',
    
    // Image picker
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Ngurra Pathways to access your photos for profile and document uploads.',
        cameraPermission: 'Allow Ngurra Pathways to use your camera for taking photos.',
      },
    ],
    
    // Location (for nearby jobs)
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Ngurra Pathways to use your location to find nearby jobs and events.',
      },
    ],
  ],
  
  // Extra configuration
  extra: {
    // Environment variables
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.ngurrapathways.com.au',
    sentryDsn: process.env.SENTRY_DSN,
    posthogApiKey: process.env.POSTHOG_API_KEY,
    
    // EAS configuration
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
    },
    
    // Feature flags
    features: {
      biometricAuth: true,
      pushNotifications: true,
      offlineMode: true,
      culturalCalendar: true,
      wellnessCheckins: true,
    },
    
    // App metadata
    appMetadata: {
      name: 'Ngurra Pathways',
      tagline: 'First Nations Employment Platform',
      description: 'Connect with culturally safe employers, access training, and find career opportunities tailored for First Nations peoples.',
      supportEmail: 'support@ngurrapathways.com.au',
      privacyUrl: 'https://ngurrapathways.com.au/privacy',
      termsUrl: 'https://ngurrapathways.com.au/terms',
    },
  },
  
  // Owner (for Expo organization)
  owner: 'ngurrapathways',
  
  // Updates configuration
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/your-project-id',
  },
  
  // Runtime version for OTA updates
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  
  // Hooks for build/submit
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      },
    ],
  },
});
