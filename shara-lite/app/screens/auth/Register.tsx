import {
  AuthView,
  Button,
  PasswordField,
  PhoneNumber,
  PhoneNumberField,
} from '@/components';
import {
  getAnalyticsService,
  getApiService,
  getStorageService,
} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useRef, useState, useEffect, useCallback} from 'react';
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
  confirmPassword?: string;
};

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .min(5, 'Number should be minimum of 5 digits')
    .required('Number is required'),
  password: yup
    .string()
    .oneOf([yup.ref('confirmPassword'), undefined], 'Passwords must match')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'Passwords must match')
    .required('Password is required'),
});

export const Register = () => {
  const storageService = getStorageService();
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();
  const {initRealm} = useInitRealm();
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
      country_code: countryCode,
      password: password.trim(),
      mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
    };
    const apiService = getApiService();
    setLoading(true);

    try {
      await apiService.register(payload);
      await initRealm({isNewUser: true});

      getAnalyticsService()
        .logEvent('signup', {method: 'mobile'})
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

  const hideWelcomeScreen = useCallback(async () => {
    await storageService.setItem('hide-welcome-screen', true);
  }, [storageService]);

  useEffect(() => {
    hideWelcomeScreen();
  }, [hideWelcomeScreen]);
  const passwordFieldRef = useRef<TextInput | null>(null);
  const confirmPasswordFieldRef = useRef<TextInput | null>(null);

  return (
    <AuthView
      header={{title: 'Sign up'}}
      isLoading={loading}
      buttonTitle="Sign Up"
      onSubmit={handleSubmit}
      heading="Get Started For Free"
      showButton={false}
      style={applyStyles('bg-white')}
      description="Sign up and enjoy all the features available on Shara. It only takes a few moments.">
      <View>
        <View style={applyStyles('pb-16')}>
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
            containerStyle={applyStyles('mb-24')}
            onChangeText={handleChange('password')}
            isInvalid={touched.password && !!errors.password}
            returnKeyType="next"
            onSubmitEditing={() => {
              setImmediate(() => {
                if (confirmPasswordFieldRef.current) {
                  confirmPasswordFieldRef.current.focus();
                }
              });
            }}
          />
          <PasswordField
            ref={confirmPasswordFieldRef}
            value={values.confirmPassword}
            label="Confirm password"
            errorMessage={errors.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            onSubmitEditing={handleSubmit}
          />
          <Button
            variantColor="red"
            onPress={handleSubmit}
            title="Sign Up"
            isLoading={loading}
            style={applyStyles('w-full mt-24')}
          />
        </View>
      </View>
      <View>
        <TouchableOpacity
          style={applyStyles('flex-row center')}
          onPress={() => navigation.replace('Login')}>
          <Text style={applyStyles('text-gray-100 text-base')}>
            Already have an account?{' '}
          </Text>
          <Text style={styles.helpSectionButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
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
