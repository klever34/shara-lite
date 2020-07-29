import {useEffect} from 'react';
import {Alert} from 'react-native';

const FallbackComponent = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      Alert.alert(
        'Oops! Something went wrong',
        'Try restarting the app or contact support for further assistance',
      );
    }
  }, []);
  return null;
};

export default FallbackComponent;
