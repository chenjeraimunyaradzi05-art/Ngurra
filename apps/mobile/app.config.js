/**
 * Expo App Configuration for Nexta
 * 
 * This configuration supports:
 * - EAS Build and Submit
 * - Deep linking and universal links
 * - Push notifications
 * - App Store and Play Store metadata
 */

export default ({ config }) => ({
  ...config,
  name: 'Nexta',
  slug: 'nexta',
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
    bundleIdentifier: 'com.nexta.app',
    buildNumber: '1',
    
    // App Store metadata
    config: {
      usesNonExemptEncryption: false,
    },
    
    // Info.plist additions
    infoPlist: {
      // Privacy permission descriptions
      NSCameraUsageDescription: 'Allow Nexta to access your camera to take photos for your profile or documents.',
      NSPhotoLibraryUsageDescription: 'Allow Nexta to access your photos to upload profile pictures or documents.',
      NSFaceIDUsageDescription: 'Use Face ID for quick and secure login to your Nexta account.',
      NSLocationWhenInUseUsageDescription: 'Allow Nexta to access your location to find nearby opportunities and events.',
      
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
      'applinks:nexta.app',
      'applinks:www.nexta.app',
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
    package: 'com.nexta.app',
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
            host: 'nexta.app',
            pathPrefix: '/jobs',
          },
          {
            scheme: 'https',
            host: 'nexta.app',
            pathPrefix: '/courses',
          },
          {
            scheme: 'https',
            host: 'nexta.app',
            pathPrefix: '/mentors',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'nexta',
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
        photosPermission: 'Allow Nexta to access your photos for profile and document uploads.',
        cameraPermission: 'Allow Nexta to use your camera for taking photos.',
      },
    ],
    
    // Location (for nearby jobs)
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Nexta to use your location to find nearby opportunities and events.',
      },
    ],
  ],
  
  // Extra configuration
  extra: {
    // Environment variables
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.nexta.app',
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
      name: 'Nexta',
      tagline: 'Your next step, connected.',
      description: 'Jobs, learning, mentors, community, business tools, financial wellbeing, and real-world opportunities in one guided platform.',
      supportEmail: 'support@nexta.app',
      privacyUrl: 'https://nexta.app/privacy',
      termsUrl: 'https://nexta.app/terms',
      developerName: 'Munyaradzi Chenjerai',
      storeListing: {
        iosFullDescription:
          'Nexta is your all-in-one pathway platform for progress - designed to help you discover opportunities, build skills, get support, and move forward with confidence.\n\nWhether you are looking for work, learning something new, building a business, or trying to stabilise your finances, Nexta brings the tools and guidance together in one place.\n\nWith Nexta you can:\n\nDiscover jobs and opportunities that match your goals\nBuild skills with learning pathways and certifications\nConnect with mentors and book sessions\nJoin communities and stay connected\nGet AI guidance for next steps, planning, and readiness\nUse practical business and money tools to stay on track\nSave and track opportunities, deadlines, and progress\nControl your privacy with clear settings and safe defaults\n\nWhy Nexta:\nMost platforms give you one piece of the puzzle. Nexta helps you build the whole pathway - from discovery to long-term stability.\nYour data, your control.\nYou choose what to share, when to share it, and who can see it.\nDownload Nexta and take your next step - and the step after that.',
        googlePlayShortDescription:
          'Your next step, connected: jobs, learning, mentors, tools, and progress.',
        googlePlayFullDescription:
          'Nexta helps you move from opportunity discovery to long-term progress - in one guided platform.\n\nFind opportunities, build skills, get support, and track your next steps with tools designed for real life.\n\nWhat you can do:\n\nExplore jobs and career pathways\nLearn with structured training and certificates\nMatch with mentors and book sessions\nJoin communities and stay motivated\nUse AI guidance to plan next steps and prepare\nTrack goals, tasks, and progress\nUse practical money and business tools\nManage privacy and safety settings easily\n\nBuilt for progress, not pressure.\nNexta is designed to feel clear, supportive, and useful - every day.',
        keywords: [
          'jobs',
          'career',
          'learning',
          'mentor',
          'coaching',
          'skills',
          'training',
          'pathways',
          'finance',
          'budgeting',
          'business',
          'community',
          'opportunities',
          'AI assistant',
        ],
      },
    },
  },
  
  // Owner (for Expo organization)
  owner: 'nexta',
  
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
