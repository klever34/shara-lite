import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';

type Fields = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
};

export const Register = ({navigation}: any) => {
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const onSubmit = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  };

  const handleNavigate = (route: string) => {
    navigation.reset({
      index: 0,
      routes: [{name: route}],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Shara</Text>
        <View>
          <TextInput
            value={fields.firstName}
            style={styles.inputField}
            placeholder="First name"
            onChangeText={(text) => onChangeText(text, 'firstName')}
          />
          <TextInput
            value={fields.lastName}
            placeholder="Last name"
            style={styles.inputField}
            onChangeText={(text) => onChangeText(text, 'lastName')}
          />
          <TextInput
            value={fields.phoneNumber}
            autoCompleteType="tel"
            keyboardType="number-pad"
            style={styles.inputField}
            placeholder="Phone number"
            onChangeText={(text) => onChangeText(text, 'phoneNumber')}
          />
          <TextInput
            secureTextEntry={true}
            placeholder="Password"
            value={fields.password}
            style={styles.inputField}
            onChangeText={(text) => onChangeText(text, 'password')}
          />
          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => handleNavigate('Login')}>
          <Text style={styles.helpSectionText}>Already have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerSection: {
    flexGrow: 1,
    marginHorizontal: 30,
    justifyContent: 'center',
  },
  inputField: {
    height: 40,
    fontSize: 16,
    width: '100%',
    marginBottom: 24,
    borderColor: 'gray',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 40,
    marginBottom: 40,
    fontWeight: 'bold',
    color: '#d51a1a',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  helpSection: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSectionText: {
    fontSize: 16,
    color: '#a8a8a8',
  },
  helpSectionButtonText: {
    fontSize: 16,
    color: '#a8a8a8',
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    backgroundColor: '#e20b0d',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    textTransform: 'uppercase',
  },
});
