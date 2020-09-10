import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from '../components/Icon';
import {colors} from '../styles';
import {FloatingLabelInput} from './FloatingLabelInput';
import {applyStyles} from '../helpers/utils';

type Props = {
  value: string;
  isInvalid?: boolean;
  placeholder?: string;
  errorMessage?: string;
  onChangeText(text: string): void;
};

export const PasswordField = (props: Props) => {
  const {value, onChangeText, placeholder = 'Password', ...rest} = props;
  const [secure, setSecure] = React.useState(true);

  const toggleSecure = () => {
    setSecure(!secure);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputFieldContainer}>
        <FloatingLabelInput
          value={value}
          autoCapitalize="none"
          secureTextEntry={secure}
          label={placeholder}
          style={styles.inputField}
          placeholderTextColor={colors['gray-50']}
          onChangeText={(text) => onChangeText(text)}
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
