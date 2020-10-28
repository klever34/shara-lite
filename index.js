/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app-v3/index';
import {name as appName} from './app.json';
import * as Sentry from '@sentry/react-native';
import {YellowBox} from 'react-native';
import Config from 'react-native-config';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.ENVIRONMENT,
});
YellowBox.ignoreWarnings(['Setting a timer']);
AppRegistry.registerComponent(appName, () => App);
