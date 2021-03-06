import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import Icon from '../components/Icon';
import {colors} from 'app-v1/styles';
import {FloatingLabelInput} from './FloatingLabelInput';
import {applyStyles} from 'app-v1/helpers/utils';

export type PasswordFieldProps = {
  value?: string;
  isInvalid?: boolean;
  placeholder?: string;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  onChangeText(text: string): void;
};

export const PasswordField = (props: PasswordFieldProps) => {
  const {
    value: initialValue = '',
    onChangeText,
    placeholder = 'Password',
    containerStyle,
    ...rest
  } = props;
  const [secure, setSecure] = React.useState(true);

  const toggleSecure = () => {
    setSecure(!secure);
  };
  const [value, setValue] = useState(initialValue);

  return (
    <View style={applyStyles(styles.container, containerStyle)}>
      <View style={styles.inputFieldContainer}>
        <FloatingLabelInput
          value={value}
          autoCapitalize="none"
          secureTextEntry={secure}
          label={placeholder}
          style={styles.inputField}
          placeholderTextColor={colors['gray-50']}
          onChangeText={(text) => {
            onChangeText(text);
            setValue(text);
          }}
          {...rest}
        />
      </View>
      <View style={styles.toggleButtonContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSecure}>
          <View style={applyStyles('px-md items-center justify-center')}>
            <Icon
              size={24}
              type="octicons"
              color="#a8a8a8"
              name={secure ? 'eye' : 'eye-closed'}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputFieldContainer: {},
  inputField: {
    fontSize: 18,
    width: '100%',
    borderBottomWidth: 1,
    fontFamily: 'Rubik-Regular',
    borderColor: colors['gray-200'],
  },
  toggleButtonContainer: {
    top: 32,
    right: 8,
    position: 'absolute',
  },
  toggleButton: {
    height: 45,
  },
});
