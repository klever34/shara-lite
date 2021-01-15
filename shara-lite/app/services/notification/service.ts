import PushNotification, {
  PushNotificationObject,
  PushNotificationScheduleObject,
} from 'react-native-push-notification';
import {PushNotificationToken} from 'types/app';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {handleError} from '../error-boundary';

export type Notification = any;

export type NotificationListener = (notification: Notification) => void;

export interface INotificationService {
  initialize(): void;
  getNotificationToken(): string;
  addEventListener(listener: NotificationListener): () => void;
  cancelAllLocalNotifications(): void;
  localNotification(options: PushNotificationObject): void;
  scheduleNotification(options: PushNotificationScheduleObject): void;
  getFCMToken(): Promise<string | undefined>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
  getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null>;
  onMessage(
    listener: (message: FirebaseMessagingTypes.RemoteMessage) => any,
  ): void;
  requestUserPermission(): Promise<
    FirebaseMessagingTypes.AuthorizationStatus | undefined
  >;
  onNotificationOpenedApp(
    listener: (message: FirebaseMessagingTypes.RemoteMessage) => any,
  ): void;
  setBackgroundMessageHandler(
    listener: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<any>,
  ): void;
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

  localNotification(options: PushNotificationObject) {
    PushNotification.localNotification(options);
  }

  scheduleNotification(options: PushNotificationScheduleObject) {
    PushNotification.localNotificationSchedule(options);
  }

  cancelAllLocalNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  onMessage(listener: (message: FirebaseMessagingTypes.RemoteMessage) => any) {
    return messaging().onMessage(listener);
  }

  setBackgroundMessageHandler(
    listener: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<any>,
  ) {
    return messaging().setBackgroundMessageHandler(listener);
  }

  subscribeToTopic(topic: string) {
    return messaging().subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic: string) {
    return messaging().unsubscribeFromTopic(topic);
  }

  onNotificationOpenedApp(
    listener: (message: FirebaseMessagingTypes.RemoteMessage) => any,
  ) {
    return messaging().onNotificationOpenedApp(listener);
  }

  async getInitialNotification() {
    return messaging().getInitialNotification();
  }

  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      return authStatus;
    }
  }

  async getFCMToken() {
    try {
      const authorized = await messaging().hasPermission();
      const fcmToken = await messaging().getToken();

      if (authorized) {
        return fcmToken;
      }

      await messaging().requestPermission();
      return fcmToken;
    } catch (error) {
      handleError(error);
    }
  }
}
