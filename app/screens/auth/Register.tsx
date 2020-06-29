import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import {RootStackParamList} from '../../index';
import {Button, PasswordField, PhoneNumberField} from '../../components';

type Fields = {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  countryCode: string;
};

export const Register = ({
  navigation,
}: StackScreenProps<RootStackParamList>) => {
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const onChangeMobile = (value: {code: string; number: string}) => {
    const {code, number} = value;
    setFields({
      ...fields,
      mobile: number,
      countryCode: code,
    });
  };

  const onSubmit = async () => {
    const {mobile, countryCode, ...rest} = fields;
    const payload = {
      ...rest,
      mobile: `${countryCode}${mobile}`,
    };
    try {
      setLoading(true);
      const registerResponse = await fetch(`${Config.API_BASE_URL}/signup`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'},
      });
      const response = await registerResponse.json();
      if (response.error) {
        setLoading(false);
        Alert.alert(response.mesage);
      } else {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error) {
      Alert.alert('Error', error);
    }
  };

  const handleNavigate = (route: string) => {
    navigation.reset({
      index: 0,
      routes: [{name: route}],
    });
  };

  const isButtonDisabled = () => {
    if (Object.keys(fields).length < 5) {
      return true;
    }
    return false;
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
          <View style={styles.inputFieldSpacer}>
            <PhoneNumberField
              value={fields.mobile}
              countryCode={fields.countryCode}
              onChangeText={(data) => onChangeMobile(data)}
            />
          </View>
          <View style={styles.inputFieldSpacer}>
            <PasswordField
              value={fields.password}
              onChangeText={(text) => onChangeText(text, 'password')}
            />
          </View>

          <Button
            title="Sign up"
            variantColor="red"
            onPress={onSubmit}
            isLoading={loading}
            disabled={isButtonDisabled() || loading}
          />
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
  inputFieldSpacer: {
    marginBottom: 24,
  },
});
