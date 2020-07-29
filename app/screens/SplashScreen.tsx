import React, {useCallback, useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {colors, dimensions} from '../styles';
import {getAuthService, getNavigationService} from '../services';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const navigationService = getNavigationService();
    navigationService.setInstance(navigation);
  });
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
        source={require('../assets/images/shara_logo_white.png')}
        style={styles.image}
      />
      <Text style={styles.text}>Connect. Share. Transact.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dimensions.fullWidth,
    height: dimensions.fullHeight,
    backgroundColor: colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '75%',
    height: '9%',
    marginBottom: 16,
    resizeMode: 'contain',
  },
  text: {color: colors.white, fontSize: 16, fontFamily: 'Rubik-Light'},
});

export default SplashScreen;
