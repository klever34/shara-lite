import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {MenuProvider} from 'react-native-popup-menu';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {withErrorBoundary} from 'react-error-boundary';
import Sentry from '@sentry/react-native';
import SplashScreen from './screens/SplashScreen';
import AuthScreens from './screens/auth';
import MainScreens from './screens/main';
import Realm from 'realm';
import {createRealm} from './services/realm';
import {getRealmService} from './services';
import {
  ActivityIndicator,
  Alert,
  View,
  BackHandler,
  Platform,
} from 'react-native';
import {colors} from './styles';
import {applyStyles} from './helpers/utils';
import FallbackComponent from './components/FallbackComponent';
import RealmProvider from './services/realm/provider';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [realm, setRealm] = useState<Realm | null>(null);
  const [error, setError] = useState(false);
  if (error) {
    return null;
  }
  if (false) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <RealmProvider>
      <NavigationContainer>
        <MenuProvider>
          <RootStack.Navigator initialRouteName="Splash">
            <RootStack.Screen
              name="Splash"
              component={SplashScreen}
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
    </RealmProvider>
  );
};

export default withErrorBoundary(App, {
  FallbackComponent,
  onError(error, componentStack) {
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
