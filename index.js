/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app/index';
import {name as appName} from './app.json';
import * as Sentry from '@sentry/react-native';
import {YellowBox} from 'react-native';
import {name, version} from './package.json';

Sentry.init({
  dsn:
    'https://394fedbf2e0f4057a3a888c7801d0c60@o426074.ingest.sentry.io/5367463',
  release: `${name}@${version}`,
});
YellowBox.ignoreWarnings(['Setting a timer']);
AppRegistry.registerComponent(appName, () => App);
