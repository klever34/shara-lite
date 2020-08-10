import React, {useEffect} from 'react';
import {Alert, View} from 'react-native';
import {FallbackProps} from 'react-error-boundary';

const ErrorFallback = ({resetErrorBoundary}: FallbackProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      Alert.alert(
        'Oops! Something went wrong',
        'Try restarting the app or contact support for further assistance',
        [{text: 'TRY AGAIN', onPress: resetErrorBoundary}],
      );
    }
  }, [resetErrorBoundary]);
  return <View>{null}</View>;
};

export default ErrorFallback;
