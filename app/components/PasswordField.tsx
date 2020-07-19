import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from '../components/Icon';
import {colors} from '../styles';

type Props = {
  value: string;
  placeholder?: string;
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
        <TextInput
          value={value}
          autoCapitalize="none"
          secureTextEntry={secure}
          placeholder={placeholder}
          style={styles.inputField}
          placeholderTextColor={colors['gray-50']}
          onChangeText={(text) => onChangeText(text)}
          {...rest}
        />
      </View>
      <View style={styles.toggleButtonContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSecure}>
          <Icon
            type="octicons"
            size={16}
            color="#a8a8a8"
            name={secure ? 'eye' : 'eye-closed'}
          />
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
    top: 16,
    right: 8,
    position: 'absolute',
  },
  toggleButton: {
    height: 45,
  },
});
