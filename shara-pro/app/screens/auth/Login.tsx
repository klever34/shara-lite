import {
  AuthView,
  Button,
  PasswordField,
  PhoneNumber,
  PhoneNumberField,
} from '@/components';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useRef, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import {useInitRealm} from '@/services/realm';

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
  password: yup.string().required('Password is required'),
});

export const Login = () => {
  const {initRealm} = useInitRealm();
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
    const {mobile, countryCode, password} = data;
    if (!countryCode) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    const payload = {
      password: password.trim(),
      mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
    };
    const apiService = getApiService();
    setLoading(true);
    try {
      await apiService.logIn(payload);
      await initRealm({initSync: true});

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

  const passwordFieldRef = useRef<TextInput | null>(null);

  return (
    <AuthView
      isLoading={loading}
      buttonTitle="Sign In"
      onSubmit={handleSubmit}
      heading="Welcome Back"
      showButton={false}
      style={applyStyles('bg-white')}
      header={{title: 'Sign In', iconLeft: {}}}
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
          returnKeyType="next"
          onSubmitEditing={() => {
            setImmediate(() => {
              if (passwordFieldRef.current) {
                passwordFieldRef.current.focus();
              }
            });
          }}
        />
        <PasswordField
          ref={passwordFieldRef}
          value={values.password}
          label="Enter your password"
          errorMessage={errors.password}
          onChangeText={handleChange('password')}
          isInvalid={touched.password && !!errors.password}
          onSubmitEditing={handleSubmit}
        />
        <Button
          variantColor="red"
          onPress={handleSubmit}
          title="Sign In"
          isLoading={loading}
          style={applyStyles('w-full mt-24')}
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
