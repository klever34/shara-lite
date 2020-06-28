import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {API_BASE_URL} from 'react-native-dotenv';
import {Button, PasswordField, PhoneNumberField} from '../../components';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string | null;
};

export const Login = ({navigation}: any) => {
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  React.useEffect(() => {
    getPhoneNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPhoneNumber = async () => {
    const mobile = await AsyncStorage.getItem('mobile');
    const countryCode = await AsyncStorage.getItem('countryCode');
    if (mobile && countryCode) {
      setFields({...fields, mobile, countryCode});
    }
  };

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
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'},
      });
      const response = await loginResponse.json();
      if (response.error) {
        Alert.alert('Error', response.mesage);
        setLoading(false);
      } else {
        const {credentials, user} = response.data;
        const {token} = credentials;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.removeItem('mobile');
        await AsyncStorage.removeItem('countryCode');
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error) {
      setLoading(false);
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
    return !fields.mobile || !fields.password;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Shara</Text>
        <View>
          <View style={styles.inputField}>
            <PhoneNumberField
              value={fields.mobile}
              countryCode={fields.countryCode}
              onChangeText={(data) => onChangeMobile(data)}
            />
          </View>
          <View style={styles.inputField}>
            <PasswordField
              value={fields.password}
              onChangeText={(text) => onChangeText(text, 'password')}
            />
          </View>
          <Button
            title="Login"
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
          onPress={() => handleNavigate('Register')}>
          <Text style={styles.helpSectionText}>Don’t have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Register</Text>
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
    marginBottom: 24,
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
