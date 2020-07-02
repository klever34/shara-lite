import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Button, PasswordField, PhoneNumberField} from '../../components';
import {getAuthService} from '../../services';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string | null;
};

export const Login = ({navigation}: any) => {
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
    const authService = getAuthService();
    try {
      setLoading(true);
      await authService.logIn(payload);
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
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
          <Text style={styles.helpSectionButtonText}>Sign up</Text>
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
