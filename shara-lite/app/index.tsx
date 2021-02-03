import {navigationRef} from '@/components/RootNavigation';
import {ToastProvider} from '@/components/Toast';
import UpdateSharaScreen from '@/screens/UpdateShara';
import {getAnalyticsService, getNotificationService} from '@/services';
import {handleError} from '@/services/error-boundary';
import IPGeolocationProvider from '@/services/ip-geolocation/provider';
import {NavigationContainer} from '@react-navigation/native';
import {NavigationState} from '@react-navigation/routers';
import {createStackNavigator} from '@react-navigation/stack';
import Sentry from '@sentry/react-native';
import React, {useCallback, useEffect} from 'react';
import {withErrorBoundary} from 'react-error-boundary';
import {Platform} from 'react-native';
import 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';
import ErrorFallback from './components/ErrorFallback';
import AuthScreens from './screens/auth';
import MainScreens from './screens/main';
import SplashScreen from './screens/SplashScreen';
import RealmProvider from './services/realm/provider';
import Config from 'react-native-config';

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
  useEffect(() => {
    getAnalyticsService().initialize().catch(handleError);
  }, []);
  useEffect(() => {
    getNotificationService().initialize();
  }, []);

  // Effect to subscribe to FCM Topic
  useEffect(() => {
    const environment = process.env.NODE_ENV;
    getNotificationService()
      .subscribeToTopic(`${Config.FCM_NOTIFICATION_TOPIC}_${environment}`)
      .then()
      .catch(handleError);

    return () => {
      getNotificationService()
        .unsubscribeFromTopic(`${Config.FCM_NOTIFICATION_TOPIC}_${environment}`)
        .then()
        .catch(handleError);
    };
  }, []);
  const getActiveRouteName = useCallback((state: NavigationState): string => {
    const route = state.routes[state.index];

    if (route.state) {
      return getActiveRouteName(route.state as NavigationState);
    }

    return route.name;
  }, []);

  return (
    <ToastProvider>
      <RealmProvider>
        <IPGeolocationProvider>
          <NavigationContainer
            ref={navigationRef}
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
