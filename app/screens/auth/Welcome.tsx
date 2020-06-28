import React from 'react';
import {Text, View, TouchableHighlight, StyleSheet} from 'react-native';

export const Welcome = ({navigation}: any) => {
  const handleNavigate = (route: string) => {
    navigation.reset({
      index: 0,
      routes: [{name: route}],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.headingText}>Shara</Text>
        <Text style={styles.bodyText}>Final mile software that delivers</Text>
      </View>
      <View style={styles.buttonSection}>
        <TouchableHighlight
          activeOpacity={0}
          underlayColor="white"
          style={{...styles.button, ...styles.loginButton}}
          onPress={() => handleNavigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0}
          underlayColor="white"
          style={styles.button}
          onPress={() => handleNavigate('Register')}>
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
    backgroundColor: '#e20b0d',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bodyText: {
    color: 'white',
    fontSize: 16,
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
    color: '#e20b0d',
    textTransform: 'uppercase',
  },
});
