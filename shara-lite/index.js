/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app/index';
import {name as appName} from './app.json';
import * as Sentry from '@sentry/react-native';
import {LogBox} from 'react-native';
import Config from 'react-native-config';
import {getNotificationService} from '@/services';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.ENVIRONMENT,
});
LogBox.ignoreLogs(['Setting a timer']);
getNotificationService().setBackgroundMessageHandler(async (remoteMessage) => {
  // handle background notification
  console.log('Message handled in the background!', remoteMessage);
});
AppRegistry.registerComponent(appName, () => App);
