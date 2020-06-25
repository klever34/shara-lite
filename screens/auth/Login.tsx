import AsyncStorage from '@react-native-community/async-storage';
import {usePubNub} from 'pubnub-react';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {API_BASE_URL} from 'react-native-dotenv';
import {Button} from '../../components';

type Fields = {
  mobile: string;
  password: string;
};

export const Login = ({navigation}: any) => {
  const pubnub = usePubNub();
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>({} as Fields);

  React.useEffect(() => {
    getPhoneNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPhoneNumber = async () => {
    const mobile = await AsyncStorage.getItem('mobile');
    if (mobile) {
      setFields({...fields, mobile});
    }
  };

  const onChangeText = (value: string, field: keyof Fields) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const onSubmit = async () => {
    setLoading(true);
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(fields),
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
      setLoading(false);
      pubnub.setUUID(fields.mobile);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    }
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
            autoCompleteType="tel"
            keyboardType="number-pad"
            style={styles.inputField}
            placeholder="Phone number"
            value={fields.mobile}
            onChangeText={(text) => onChangeText(text, 'mobile')}
          />
          <TextInput
            secureTextEntry={true}
            placeholder="Password"
            value={fields.password}
            style={styles.inputField}
            onChangeText={(text) => onChangeText(text, 'password')}
          />
          <Button
            label="Login"
            variantColor="red"
            onPress={onSubmit}
            isLoading={loading}
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
