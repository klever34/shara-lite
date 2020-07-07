import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {RootStackParamList} from '../index';
import {colors, dimensions} from '../styles';
import {getAuthService} from '../services';

type SplashScreenProps = StackScreenProps<RootStackParamList> & {};

const styles = StyleSheet.create({
  container: {
    width: dimensions.fullWidth,
    height: dimensions.fullHeight,
    backgroundColor: colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {width: '100%', height: 200},
});

const SplashScreen = ({navigation}: SplashScreenProps) => {
  const handleRedirect = useCallback(async () => {
    const authService = getAuthService();
    await authService.initialize();
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
  }, [navigation]);

  useEffect(() => {
    setTimeout(handleRedirect, 750);
  }, [handleRedirect]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splash-screen.png')}
        style={styles.image}
      />
    </View>
  );
};

export default SplashScreen;
