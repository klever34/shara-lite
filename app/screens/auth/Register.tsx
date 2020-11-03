import {AuthView, PasswordField, PhoneNumberField} from '@/components';
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
  confirmPassword?: string;
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
    .oneOf([yup.ref('confirmPassword'), undefined], 'Passwords must match')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .strict(true)
    .trim("Password shouldn't contain spaces")
    .oneOf([yup.ref('password'), undefined], 'Passwords must match')
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
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <AuthView
      title="Sign up"
      isLoading={loading}
      buttonTitle="Sign Up"
      onSubmit={handleSubmit}
      heading="Get Started For Free"
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
            value={{number: values.mobile, code: values.countryCode}}
          />
          <PasswordField
            value={values.password}
            label="Enter your password"
            errorMessage={errors.password}
            containerStyle={applyStyles('mb-24')}
            onChangeText={handleChange('password')}
            isInvalid={touched.password && !!errors.password}
          />
          <PasswordField
            value={values.confirmPassword}
            label="Confirm password"
            errorMessage={errors.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
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
