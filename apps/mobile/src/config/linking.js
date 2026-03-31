/**
 * Deep Linking Configuration
 *
 * Enables deep linking and universal links for the Nexta mobile app.
 *
 * Supported URL patterns:
 * - nexta://job/{id} - Open job detail
 * - nexta://mentor/{id} - Open mentor profile
 * - nexta://course/{id} - Open course detail
 * - nexta://messages - Open messages
 * - nexta://wellness - Open wellness check-in
 * - nexta://applications - Open my applications
 * - https://nexta.app/jobs/{id} - Universal link to job
 */

import * as Linking from 'expo-linking';

// App scheme prefix
const prefix = Linking.createURL('/');

/**
 * Deep linking configuration for React Navigation
 */
export const linking = {
  prefixes: [
    prefix,
    'nexta://',
    'https://nexta.app',
    'https://www.nexta.app',
  ],
  
  config: {
    screens: {
      // Auth screens (unauthenticated)
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      
      // Main tabs
      Main: {
        screens: {
          Home: 'home',
          Jobs: 'jobs',
          Courses: 'courses',
          Community: 'community',
          Profile: 'profile',
        },
      },
      
      // Stack screens (authenticated)
      JobDetail: {
        path: 'job/:id',
        parse: {
          id: (id) => id,
        },
      },
      
      MentorDetail: {
        path: 'mentor/:id',
        parse: {
          id: (id) => id,
        },
      },
      
      Mentorship: 'mentorship',
      Messages: 'messages',
      Settings: 'settings',
      
      Apply: {
        path: 'apply/:jobId',
        parse: {
          jobId: (jobId) => jobId,
        },
      },
      
      BookSession: {
        path: 'book/:mentorId',
        parse: {
          mentorId: (mentorId) => mentorId,
        },
      },
      
      CulturalCalendar: 'cultural-calendar',
      Resources: 'resources',
      MyApplications: 'applications',
      SavedJobs: 'saved-jobs',
      Wellness: 'wellness',
      NextaAI: 'ai',
      MoneyTools: 'money-tools',
      NotificationPreferences: 'notification-preferences',
      Notifications: 'notifications',
      CourseDetail: {
        path: 'course/:id',
        parse: {
          id: (id) => id,
        },
      },
      SecuritySettings: 'security',
      ActiveSessions: 'sessions',
    },
  },
  
  /**
   * Handle initial URL when app is opened via deep link
   */
  async getInitialURL() {
    // First check if the app was opened via a deep link
    const url = await Linking.getInitialURL();
    
    if (url != null) {
      return url;
    }
    
    return null;
  },
  
  /**
   * Subscribe to incoming links while app is running
   */
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });
    
    return () => {
      subscription.remove();
    };
  },
};

/**
 * Generate a deep link URL for sharing
 * @param {string} screen - Screen name
 * @param {object} params - Screen parameters
 * @returns {string} Deep link URL
 */
export function generateDeepLink(screen, params = {}) {
  switch (screen) {
    case 'JobDetail':
      return `nexta://job/${params.id}`;
    case 'MentorDetail':
      return `nexta://mentor/${params.id}`;
    case 'CourseDetail':
      return `nexta://course/${params.id}`;
    case 'Apply':
      return `nexta://apply/${params.jobId}`;
    case 'BookSession':
      return `nexta://book/${params.mentorId}`;
    case 'Messages':
      return 'nexta://messages';
    case 'Notifications':
      return 'nexta://notifications';
    case 'Wellness':
      return 'nexta://wellness';
    case 'MyApplications':
      return 'nexta://applications';
    case 'SavedJobs':
      return 'nexta://saved-jobs';
    case 'CulturalCalendar':
      return 'nexta://cultural-calendar';
    case 'Resources':
      return 'nexta://resources';
    case 'SecuritySettings':
      return 'nexta://security';
    case 'ActiveSessions':
      return 'nexta://sessions';
    default:
      return 'nexta://';
  }
}

/**
 * Generate a web URL for universal linking
 * @param {string} screen - Screen name
 * @param {object} params - Screen parameters
 * @returns {string} Web URL
 */
export function generateWebLink(screen, params = {}) {
  const baseUrl = 'https://nexta.app';
  
  switch (screen) {
    case 'JobDetail':
      return `${baseUrl}/jobs/${params.id}`;
    case 'MentorDetail':
      return `${baseUrl}/mentors/${params.id}`;
    case 'CourseDetail':
      return `${baseUrl}/courses/${params.id}`;
    case 'Apply':
      return `${baseUrl}/jobs/${params.jobId}/apply`;
    case 'Messages':
      return `${baseUrl}/member/messages`;
    case 'Notifications':
      return `${baseUrl}/member/notifications`;
    case 'Wellness':
      return `${baseUrl}/member/wellness`;
    case 'MyApplications':
      return `${baseUrl}/member/applications`;
    case 'SavedJobs':
      return `${baseUrl}/member/saved-jobs`;
    case 'CulturalCalendar':
      return `${baseUrl}/events/cultural`;
    case 'Resources':
      return `${baseUrl}/resources`;
    case 'SecuritySettings':
      return `${baseUrl}/member/security`;
    default:
      return baseUrl;
  }
}

export default linking;
