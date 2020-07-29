import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {Button, PasswordField, PhoneNumberField} from '../../components';
import {getApiService} from '../../services';
import {colors} from '../../styles';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import {useErrorHandler} from 'react-error-boundary';

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
  const handleError = useErrorHandler();
  const onSubmit = async () => {
    const {mobile, countryCode, ...rest} = fields;
    const payload = {
      ...rest,
      mobile: `${countryCode}${mobile}`,
    };
    const apiService = getApiService();
    try {
      setLoading(true);
      await apiService.logIn(payload);
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      handleError(error);
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
    <ScrollView style={styles.container}>
      <View style={styles.backButton}>
        <Touchable onPress={() => handleNavigate('Welcome')}>
          <Icon size={24} type="ionicons" name="md-arrow-back" />
        </Touchable>
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.description}>Sign in to your account</Text>
      </View>
      <View style={styles.form}>
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
          title="Continue"
          variantColor="red"
          onPress={onSubmit}
          isLoading={loading}
          disabled={isButtonDisabled() || loading}
        />
      </View>
      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => handleNavigate('Register')}>
          <Text style={styles.helpSectionText}>Don’t have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
  backButton: {
    marginBottom: 48,
  },
  headerSection: {
    marginBottom: 48,
  },
  heading: {
    fontSize: 24,
    paddingBottom: 8,
    color: colors.black,
    fontFamily: 'CocogoosePro-Regular',
  },
  description: {
    fontSize: 16,
    lineHeight: 27,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
  },
  form: {
    paddingBottom: 32,
  },
  inputField: {
    marginBottom: 24,
  },
  helpSection: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSectionText: {
    fontSize: 16,
    color: colors['gray-100'],
    fontFamily: 'Rubik-Regular',
  },
  helpSectionButtonText: {
    fontSize: 16,
    color: colors.black,
    fontFamily: 'Rubik-Regular',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    textDecorationColor: colors.black,
  },
});
