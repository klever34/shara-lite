import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  value: string;
  placeholder?: string;
  onChangeText(text: string): void;
};

export const PasswordField = (props: Props) => {
  const {value, onChangeText, placeholder = 'Password'} = props;
  const [secure, setSecure] = React.useState(true);

  const toggleSecure = () => {
    setSecure(!secure);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputFieldContainer}>
        <TextInput
          value={value}
          secureTextEntry={secure}
          placeholder={placeholder}
          style={styles.inputField}
          onChangeText={(text) => onChangeText(text)}
        />
      </View>
      <View style={styles.toggleButton}>
        <TouchableOpacity onPress={toggleSecure}>
          <Text>{secure ? 'Show' : 'Hide'}</Text>
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
    top: 8,
    right: 8,
    position: 'absolute',
  },
});
