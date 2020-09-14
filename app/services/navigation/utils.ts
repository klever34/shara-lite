import {useNavigation, StackActions} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';
import {NavigationProp} from '@react-navigation/core/lib/typescript/src/types';
import {ParamListBase} from '@react-navigation/routers';

export const useAppNavigation = <T extends NavigationProp<ParamListBase>>() => {
  const navigation = useNavigation<T>();
  const replace = useCallback(
    (route: string, params?: {[key: string]: any}) => {
      navigation.dispatch(StackActions.replace(route, params));
    },
    [navigation],
  );
  return useMemo(() => ({...navigation, replace}), [navigation, replace]);
};
