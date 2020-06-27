import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProperties,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';

type Props = {
  value: string;
  placeholder?: string;
  onChangeText(text: string): void;
} & TextInputProperties;

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
          onChangeText={(text) => onChangeText(text)}
          {...rest}
        />
      </View>
      <View style={styles.toggleButton}>
        <TouchableOpacity onPress={toggleSecure}>
          <Icon
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
    height: 40,
    fontSize: 16,
    width: '100%',
    borderColor: 'gray',
    borderBottomWidth: 1,
  },
  toggleButton: {
    top: 10,
    right: 8,
    position: 'absolute',
  },
});
