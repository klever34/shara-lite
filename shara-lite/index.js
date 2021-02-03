/**
 * @format
 */

import * as Sentry from '@sentry/react-native';
import {AppRegistry, LogBox} from 'react-native';
import Config from 'react-native-config';
import {name as appName} from './app.json';
import App from './app/index';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.ENVIRONMENT,
});
LogBox.ignoreLogs(['Setting a timer']);
AppRegistry.registerComponent(appName, () => App);
