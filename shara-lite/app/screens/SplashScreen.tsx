import React, {useCallback, useEffect} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, dimensions} from '../styles';
import {getAuthService, getNavigationService} from '../services';
import {useNavigation} from '@react-navigation/native';
import {useInitRealm} from '@/services/realm';

const SplashScreen = () => {
  const navigation = useNavigation();
  const {initRealm} = useInitRealm();

  useEffect(() => {
    const navigationService = getNavigationService();
    navigationService.setInstance(navigation);
  });
  const handleRedirect = useCallback(
    async () => {
      const authService = getAuthService();
      await authService.initialize();

      if (authService.isLoggedIn()) {
        try {
          initRealm();
        } catch (e) {
          Alert.alert(
            'Oops! Something went wrong.',
            'Try clearing app data from application settings',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (process.env.NODE_ENV === 'production') {
                    if (Platform.OS === 'android') {
                      BackHandler.exitApp();
                    }
                  }
                },
              },
            ],
          );
        }
      }

      setTimeout(() => {
        if (authService.isLoggedIn()) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'Auth'}],
          });
        }
      }, 750);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  );

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/shara-lite_logo.png')}
        style={styles.image}
      />
      <Text style={styles.text}>
        Keep track of who owes you and get paid faster
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dimensions.fullWidth,
    height: dimensions.fullHeight,
    backgroundColor: colors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '25%',
    marginBottom: 24,
    resizeMode: 'contain',
  },
  text: {
    color: colors.black,
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    maxWidth: 300,
    textAlign: 'center',
    lineHeight: 32,
  },
});

export default SplashScreen;
