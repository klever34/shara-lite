import {
  AuthView,
  PasswordField,
  PhoneNumber,
  PhoneNumberField,
} from '@/components';
import {getAnalyticsService, getApiService, getRealmService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {initLocalRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {applyStyles, colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useContext, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as yup from 'yup';

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

export const Login = () => {
  const {updateLocalRealm} = useContext(RealmContext);
  const {callingCode} = useIPGeolocation();
  const {
    errors,
    values,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: FormDefaults.get('login', {
      mobile: '',
      password: '',
      countryCode: callingCode,
    }) as Fields,
    onSubmit: (payload) => onSubmit(payload),
  });
  const [loading, setLoading] = useState(false);

  const onChangeMobile = (value: PhoneNumber) => {
    setFieldValue('countryCode', value.callingCode);
    setFieldValue('mobile', value.number);
  };
  const handleError = useErrorHandler();
  const onSubmit = async (data: Fields) => {
    const {mobile, countryCode, ...rest} = data;
    const payload = {
      ...rest,
      mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
    };
    const apiService = getApiService();
    setLoading(true);
    try {
      await apiService.logIn(payload);
      const createdLocalRealm = await initLocalRealm();
      updateLocalRealm && updateLocalRealm(createdLocalRealm);
      const realmService = getRealmService();
      realmService.setInstance(createdLocalRealm);

      getAnalyticsService()
        .logEvent('login', {method: 'mobile'})
        .catch(handleError);
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

  const navigation = useAppNavigation();

  return (
    <AuthView
      title="Sign In"
      isLoading={loading}
      buttonTitle="Sign In"
      onSubmit={handleSubmit}
      heading="Welcome Back"
      style={applyStyles('bg-white')}
      description="Sign in and enjoy all the features available on Shara. It only takes a few moments.">
      <View style={applyStyles('pb-32')}>
        <PhoneNumberField
          errorMessage={errors.mobile}
          placeholder="Enter your number"
          label="What's your phone number?"
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          isInvalid={touched.mobile && !!errors.mobile}
          value={{number: values.mobile, callingCode: values.countryCode}}
        />
        <PasswordField
          value={values.password}
          label="Enter your password"
          errorMessage={errors.password}
          onChangeText={handleChange('password')}
          isInvalid={touched.password && !!errors.password}
        />
      </View>

      <TouchableOpacity
        style={applyStyles('flex-row center')}
        onPress={() =>
          navigation.navigate('ForgotPassword', {
            mobile: {number: values.mobile, code: values.countryCode},
          })
        }>
        <Text style={applyStyles('mb-12 text-gray-100', {fontSize: 16})}>
          Forgot your password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={applyStyles('flex-row center')}
        onPress={() => navigation.replace('Register')}>
        <View style={applyStyles('flex-row')}>
          <Text style={applyStyles('text-gray-100', {fontSize: 16})}>
            Don’t have an account?{' '}
          </Text>
          <Text style={styles.helpSectionButtonText}>Sign Up</Text>
        </View>
      </TouchableOpacity>
    </AuthView>
  );
};

const styles = StyleSheet.create({
  helpSectionButtonText: {
    fontSize: 16,
    color: colors.black,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    textDecorationColor: colors.black,
  },
});
