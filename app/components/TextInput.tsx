import React from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import {colors} from '../styles';
import {applyStyles} from '../helpers/utils';

type TextInputProps = RNTextInputProps & {};

const TextInput = ({style, ...restProps}: TextInputProps) => {
  return (
    <RNTextInput {...restProps} style={applyStyles(styles.inputField, style)} />
  );
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
