import {AuthView} from '@/components/AuthView';
import {applyStyles} from '@/helpers/utils';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {initLocalRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {colors} from '@/styles';
import React, {useContext} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Button, PasswordField, PhoneNumberField} from '../../components';
import {
  getAnalyticsService,
  getApiService,
  getRealmService,
} from '../../services';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string;
};

export const Login = () => {
  const {updateLocalRealm} = useContext(RealmContext);
  const {callingCode} = useIPGeolocation();
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Fields>(
    FormDefaults.get('login', {countryCode: callingCode}) as Fields,
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
      const createdLocalRealm = await initLocalRealm();
      updateLocalRealm && updateLocalRealm(createdLocalRealm);
      const realmService = getRealmService();
      realmService.setInstance(createdLocalRealm);

      setLoading(false);
      getAnalyticsService()
        .logEvent('login', {method: 'mobile'})
        .catch(handleError);
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const navigation = useAppNavigation();

  const isButtonDisabled = () => {
    return !fields.mobile || !fields.password;
  };

  return (
    <AuthView title="Welcome Back!" description="Sign in to your account.">
      <View style={styles.form}>
        <View style={styles.inputField}>
          <PhoneNumberField
            value={{number: fields.mobile, code: fields.countryCode}}
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
          disabled={isButtonDisabled()}
        />
      </View>
      <View style={applyStyles('mb-16')}>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() =>
            navigation.navigate('ForgotPassword', {
              mobile: {number: fields.mobile, code: fields.countryCode},
            })
          }>
          <Text style={styles.helpSectionText}>Forgot your password? </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => navigation.replace('Register')}>
          <Text style={styles.helpSectionText}>Don’t have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign Up</Text>
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
    marginBottom: 16,
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
