import {useEffect} from 'react';
import {Alert} from 'react-native';

const FallbackComponent = () => {
  useEffect(() => {
    Alert.alert(
      'Oops! Something went wrong',
      'Try restarting the app or contact support for further assistance',
    );
  }, []);
  return null;
};

export default FallbackComponent;
