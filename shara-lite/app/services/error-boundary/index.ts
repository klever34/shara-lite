// import {ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';

export const handleError = (error: Error) => {
  if (error.message) {
    Toast.show(error.message, Toast.SHORT);
  }
  console.log('Error: ', error);
  if (error.stack) {
    console.log('Stack: ', error.stack);
  }
};

export const useErrorHandler = () => {
  return handleError;
};
