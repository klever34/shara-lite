import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Button,
  FloatingLabelInput,
  PasswordField,
  PhoneNumberField,
} from '../../components';
import {applyStyles} from '@/helpers/utils';
import {getApiService} from '@/services';
import {colors} from '@/styles';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {AuthView} from '@/components/AuthView';

type Fields = {
  firstname: string;
  lastname: string;
  mobile: string;
  password: string;
  countryCode: string;
};

export const Register = () => {
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>(
    FormDefaults.get('signup', {countryCode: callingCode}) as Fields,
  );

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
      country_code: countryCode,
      mobile: `${countryCode}${mobile}`,
    };
    const apiService = getApiService();
    try {
      setLoading(true);
      await apiService.register(payload);
      setLoading(false);
      navigation.replace('Login');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const isButtonDisabled = () => {
    return Object.keys(fields).length < 5;
  };

  return (
    <AuthView
      title="Sign Up"
      description="Create an account to do business faster and better.">
      <View>
        <View style={applyStyles({marginBottom: 32})}>
          <View style={styles.inputFieldSpacer}>
            <FloatingLabelInput
              label="First Name"
              value={fields.firstname}
              inputStyle={styles.inputField}
              onChangeText={(text) => onChangeText(text, 'firstname')}
            />
          </View>
          <View style={styles.inputFieldSpacer}>
            <FloatingLabelInput
              label="Last Name"
              value={fields.lastname}
              inputStyle={styles.inputField}
              onChangeText={(text) => onChangeText(text, 'lastname')}
            />
          </View>
          <View style={applyStyles({paddingVertical: 18})}>
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
        </View>
      </View>
      <View>
        <Button
          variantColor="red"
          onPress={onSubmit}
          isLoading={loading}
          title="Create an account"
          style={applyStyles({
            marginBottom: 24,
          })}
          disabled={isButtonDisabled()}
        />
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.helpSectionText}>Already have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
  backButton: {
    marginBottom: 24,
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
    fontSize: 18,
    width: '100%',
  },
  headerText: {
    fontSize: 40,
    marginBottom: 40,
    color: '#d51a1a',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'CocogoosePro-Regular',
  },
  helpSection: {
    marginBottom: 80,
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
  inputFieldSpacer: {
    paddingBottom: 18,
  },
});
