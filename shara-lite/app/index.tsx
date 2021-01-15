import 'react-native-gesture-handler';
import React, {useCallback, useEffect, useState} from 'react';
import {MenuProvider} from 'react-native-popup-menu';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {withErrorBoundary} from 'react-error-boundary';
import Sentry from '@sentry/react-native';
import SplashScreen from './screens/SplashScreen';
import AuthScreens from './screens/auth';
import MainScreens from './screens/main';
import ErrorFallback from './components/ErrorFallback';
import RealmProvider from './services/realm/provider';
import {
  getRemoteConfigService,
  getAnalyticsService,
  getNotificationService,
  getI18nService,
} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {ActivityIndicator, Platform} from 'react-native';
import IPGeolocationProvider from '@/services/ip-geolocation/provider';
import {NavigationState} from '@react-navigation/routers';
import {ToastProvider} from '@/components/Toast';
import UpdateSharaScreen from '@/screens/UpdateShara';
import {colors} from '@/styles';

if (Platform.OS === 'android') {
  // only android needs polyfill
  require('intl');
  require('intl/locale-data/jsonp/en-GB');
}

export type RootStackParamList = {
  UpdateShara: undefined;
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

const App = () => {
  const handleError = useErrorHandler();

  useEffect(() => {
    getAnalyticsService().initialize().catch(handleError);
  }, [handleError]);

  useEffect(() => {
    getNotificationService().initialize();
  }, []);

  const [remoteConfigLoaded, setRemoteConfigLoaded] = useState(false);
  useEffect(() => {
    getRemoteConfigService()
      .initialize()
      .then(() => {
        return getI18nService().initialize();
      })
      .catch(handleError)
      .finally(() => {
        setRemoteConfigLoaded(true);
      });
  }, [handleError]);
  const getActiveRouteName = useCallback((state: NavigationState): string => {
    const route = state.routes[state.index];

    if (route.state) {
      return getActiveRouteName(route.state as NavigationState);
    }

    return route.name;
  }, []);

  if (!remoteConfigLoaded) {
    return <ActivityIndicator color={colors.primary} size="large" />;
  }

  return (
    <ToastProvider>
      <RealmProvider>
        <IPGeolocationProvider>
          <NavigationContainer
            onStateChange={(state) => {
              if (!state) {
                return;
              }
              const analyticsService = getAnalyticsService();
              analyticsService
                .tagScreenName(getActiveRouteName(state))
                .catch(handleError);
            }}>
            <MenuProvider>
              <RootStack.Navigator initialRouteName="Splash">
                <RootStack.Screen
                  name="Splash"
                  component={SplashScreen}
                  options={{headerShown: false}}
                />
                <RootStack.Screen
                  name="UpdateShara"
                  component={UpdateSharaScreen}
                  options={{headerShown: false}}
                />
                <RootStack.Screen
                  name="Auth"
                  component={AuthScreens}
                  options={{headerShown: false}}
                />
                <RootStack.Screen
                  name="Main"
                  component={MainScreens}
                  options={{headerShown: false}}
                />
              </RootStack.Navigator>
            </MenuProvider>
          </NavigationContainer>
        </IPGeolocationProvider>
      </RealmProvider>
    </ToastProvider>
  );
};

export default withErrorBoundary(App, {
  FallbackComponent: ErrorFallback,
  onError: (error: Error, componentStack: string) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, (scope) => {
        if (componentStack) {
          scope.addBreadcrumb({
            category: 'exception.stack',
            message: componentStack,
            level: Sentry.Severity.Error,
          });
        }
        return scope;
      });
    } else {
      console.log('Error: ', error);
      console.log('Stack: ', componentStack);
    }
  },
});
