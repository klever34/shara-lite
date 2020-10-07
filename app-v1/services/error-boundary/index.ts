import {useCallback} from 'react';
import {ToastAndroid} from 'react-native';

export const useErrorHandler = () => {
  return useCallback((error: Error) => {
    if (error.message) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
    console.log('Error: ', error);
    if (error.stack) {
      console.log('Stack: ', error.stack);
    }
  }, []);
};
