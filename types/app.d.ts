type User = {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  country_code: string;
  created_at: string;
  updated_at: string;
};

type PushNotificationToken = {
  token: string;
  os: string;
};

type PushNotificationData = {
  foreground: boolean;
  userInteraction: boolean;
  message: string;
  data: any;
};

type ApiResponse<T extends any = any> = {
  data: any;
  message: string;
};

declare module 'react-native-push-notification';
