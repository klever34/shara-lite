import React from 'react';
import {Text, View, TouchableHighlight, StyleSheet, Image} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {useAppNavigation} from '@/services/navigation';

export const Welcome = () => {
  const navigation = useAppNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Image
          source={require('../../assets/images/shara_logo_white.png')}
          style={styles.image}
        />
        <Text style={applyStyles('text-white text-base text-300')}>
          The Last Ledger You'll Ever Need
        </Text>
      </View>
      <View style={styles.buttonSection}>
        <TouchableHighlight
          activeOpacity={0}
          underlayColor="white"
          style={{...styles.button, ...styles.loginButton}}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0}
          underlayColor="white"
          style={styles.button}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '75%',
    height: '9%',
    marginBottom: 16,
    resizeMode: 'contain',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loginButton: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Regular',
  },
});
