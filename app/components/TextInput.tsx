import React from 'react';
import {StyleSheet, TextInput as RNTextInput} from 'react-native';
import {colors} from '../styles';

const TextInput = ({...restProps}) => {
  return <RNTextInput {...restProps} style={styles.inputField} />;
};

const styles = StyleSheet.create({
  inputField: {
    fontSize: 18,
    width: '100%',
    marginBottom: 24,
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
  },
});

export default TextInput;
