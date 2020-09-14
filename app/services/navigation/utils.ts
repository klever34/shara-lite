import {useNavigation, StackActions} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';

export const useAppNavigation = () => {
  const navigation = useNavigation();
  const handleNavigate = useCallback(
    (route: string) => {
      navigation.reset({
        index: 0,
        routes: [{name: route}],
      });
    },
    [navigation],
  );
  const replace = useCallback(
    (route: string, params?: {[key: string]: any}) => {
      navigation.dispatch(StackActions.replace(route, params));
    },
    [navigation],
  );
  return useMemo(() => ({...navigation, replace, handleNavigate}), [
    handleNavigate,
    navigation,
    replace,
  ]);
};
