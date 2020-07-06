type User = {
  id: number;
  mobile: string;
  email?: string;
  firstname?: string;
  lastname?: string;
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
