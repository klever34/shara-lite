import {useEffect} from 'react';
import analytics from '@segment/analytics-react-native';
import {useErrorHandler} from 'react-error-boundary';
import {useRoute} from '@react-navigation/native';

export const useScreenRecord = () => {
  const handleError = useErrorHandler();
  const route = useRoute();
  useEffect(() => {
    analytics.screen(route.name).catch(handleError);
  }, [handleError, route.name]);
};
