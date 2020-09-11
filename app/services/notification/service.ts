import PushNotification from 'react-native-push-notification';
import {PushNotificationToken} from 'types/app';

export type Notification = any;

export type NotificationListener = (notification: Notification) => void;

export interface INotificationService {
  initialize(): void;
  getNotificationToken(): string;
  addEventListener(listener: NotificationListener): () => void;
  cancelAllLocalNotifications(): void;
}

export class NotificationService implements INotificationService {
  private notificationToken: string = '';
  private listeners: NotificationListener[] = [];
  initialize() {
    PushNotification.configure({
      onRegister: (token: PushNotificationToken) => {
        this.notificationToken = token.token;
      },
      onNotification: (notification: Notification) => {
        this.listeners.forEach((listener) => {
          listener(notification);
        });
      },
    });
  }

  getNotificationToken(): string {
    return this.notificationToken;
  }

  addEventListener(listener: (notification: any) => void) {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter(
        (listenerItem) => listenerItem !== listener,
      );
    };
  }

  cancelAllLocalNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }
}
