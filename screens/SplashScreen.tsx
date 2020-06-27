import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {Image, StyleSheet, View} from 'react-native';
import {RootStackParamList} from '../App';
import {colors, dimensions} from '../styles/base';

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
  useEffect(() => {
    setTimeout(handleRedirect, 750);
  });

  const isLoggedIn = async () => {
    const token = await AsyncStorage.getItem('token');
    return token;
  };

  const handleRedirect = async () => {
    const token = await isLoggedIn();
    if (token) {
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
  };

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
