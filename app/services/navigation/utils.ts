import {
  useNavigation,
  StackActions,
  useNavigationState,
} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {NavigationProp} from '@react-navigation/core/lib/typescript/src/types';
import {ParamListBase} from '@react-navigation/routers';
import {BackHandler, ToastAndroid} from 'react-native';

export const useAppNavigation = <T extends ParamListBase>() => {
  const navigation = useNavigation<NavigationProp<T>>();
  const replace = useCallback(
    (route: string, params?: {[key: string]: any}) => {
      navigation.dispatch(StackActions.replace(route, params));
    },
    [navigation],
  );
  return useMemo(() => ({...navigation, replace}), [navigation, replace]);
};

export const useRepeatBackToExit = () => {
  const [backClickCount, setBackClickCount] = useState<0 | 1>(0);
  const navigationState = useNavigationState((state) => state);
  const spring = useCallback(() => {
    const duration = 1500;
    setBackClickCount(1);
    ToastAndroid.show('Press BACK again to exit', duration);
    setTimeout(() => {
      setBackClickCount(0);
    }, duration);
  }, []);
  const handleBackButton = useCallback(() => {
    const mainRoute = navigationState.routes[0];
    if (mainRoute.state) {
      if (mainRoute.state.routes.length !== 1) {
        return false;
      }
      if (mainRoute.state.routes[0].name === 'Home') {
        const homeRoute = mainRoute.state.routes[0];
        if (homeRoute.state) {
          if (homeRoute.state.index !== 0) {
            return false;
          }
        }
      }
    }
    if (backClickCount === 1) {
      BackHandler.exitApp();
    } else {
      spring();
    }
    return true;
  }, [backClickCount, navigationState.routes, spring]);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [handleBackButton]);
};
