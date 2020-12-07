import {ToastAndroid} from 'react-native';

export const handleError = (error: Error) => {
  if (error.message) {
    ToastAndroid.show(error.message, ToastAndroid.SHORT);
  }
  console.log('Error: ', error);
  if (error.stack) {
    console.log('Stack: ', error.stack);
  }
};

export const useErrorHandler = () => {
  return handleError;
};
