interface NotificationOptions {
  id?: string;
  message: string;
  variant?: 'info' | 'success' | 'error' | 'warning';
  autoHideMs?: number;
  testId?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationsContext {
  showNotification: (options: NotificationOptions) => string;
  hideNotification: (id: string) => void;
}

export function useNotifications(): NotificationsContext;
export default function NotificationProvider(props: { children: React.ReactNode }): JSX.Element;
