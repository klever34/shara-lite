/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app/index';
import {name as appName} from './app.json';
import * as Sentry from '@sentry/react-native';
import {YellowBox} from 'react-native';
import {name, version} from './package.json';
import Config from 'react-native-config';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  release: `${name}@${version}`,
  environment: Config.ENVIRONMENT,
});
YellowBox.ignoreWarnings(['Setting a timer']);
AppRegistry.registerComponent(appName, () => App);
