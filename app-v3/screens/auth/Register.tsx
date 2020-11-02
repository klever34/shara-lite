import {
  AuthView,
  Button,
  PasswordField,
  PhoneNumberField,
} from 'app-v3/components';
import {
  getAnalyticsService,
  getApiService,
  getRealmService,
} from 'app-v3/services';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {FormDefaults} from 'app-v3/services/FormDefaults';
import {useIPGeolocation} from 'app-v3/services/ip-geolocation/provider';
import {useAppNavigation} from 'app-v3/services/navigation';
import {initLocalRealm} from 'app-v3/services/realm';
import {RealmContext} from 'app-v3/services/realm/provider';
import {colors} from 'app-v3/styles';
import {useFormik} from 'formik';
import React, {useContext, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as yup from 'yup';
import {applyStyles} from 'app-v3/styles';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string;
};

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .min(5, 'Number should be minimum of 5 digits')
    .required('Number is required'),
  password: yup
    .string()
    .strict(true)
    .trim("Password shouldn't contain spaces")
    .required('Password is required'),
});

export const Register = () => {
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();
  const {updateLocalRealm, setIsSyncCompleted} = useContext(RealmContext);
  const {
    errors,
    values,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: FormDefaults.get('signup', {
      mobile: '',
      password: '',
      countryCode: callingCode,
    }) as Fields,
    onSubmit: (payload) => onSubmit(payload),
  });
  const [loading, setLoading] = useState(false);

  const onChangeMobile = (value: {code: string; number: string}) => {
    const {code, number} = value;
    setFieldValue('countryCode', code);
    setFieldValue('mobile', number);
  };
  const handleError = useErrorHandler();
  const onSubmit = async (data: Fields) => {
    const {mobile, countryCode, ...rest} = data;
    const payload = {
      ...rest,
      country_code: countryCode,
      mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
    };
    const apiService = getApiService();
    setLoading(true);

    try {
      await apiService.register(payload);
      const createdLocalRealm = await initLocalRealm();
      updateLocalRealm && updateLocalRealm(createdLocalRealm);
      setIsSyncCompleted && setIsSyncCompleted(true);
      const realmService = getRealmService();
      realmService.setInstance(createdLocalRealm);

      getAnalyticsService()
        .logEvent('signup', {method: 'mobile'})
        .catch(handleError);
      setLoading(false);
      navigation.replace('BusinessSetup');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <AuthView
      title="Sign Up"
      description="Create an account to do business faster and better.">
      <View>
        <View style={applyStyles({marginBottom: 32})}>
          <View style={applyStyles({paddingVertical: 18})}>
            <PhoneNumberField
              errorMessage={errors.mobile}
              onChangeText={(data) => onChangeMobile(data)}
              isInvalid={touched.mobile && !!errors.mobile}
              value={{number: values.mobile, code: values.countryCode}}
            />
          </View>
          <View style={styles.inputFieldSpacer}>
            <PasswordField
              value={values.password}
              errorMessage={errors.password}
              onChangeText={handleChange('password')}
              isInvalid={touched.password && !!errors.password}
            />
          </View>
        </View>
      </View>
      <View>
        <Button
          variantColor="red"
          isLoading={loading}
          onPress={handleSubmit}
          title="Create an account"
          style={applyStyles({
            marginBottom: 24,
          })}
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
