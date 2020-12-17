import {AuthView, Button, PhoneNumber, PhoneNumberField} from '@/components';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import * as yup from 'yup';

type Fields = {
  mobile: string;
  countryCode: string;
};

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .min(5, 'Number should be minimum of 5 digits')
    .required('Number is required'),
});

export const Login = () => {
  const {callingCode} = useIPGeolocation();
  const {errors, values, touched, handleSubmit, setFieldValue} = useFormik({
    validationSchema,
    initialValues: FormDefaults.get('login', {
      mobile: '',
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
    const {mobile, countryCode} = data;
    if (!countryCode) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    const payload = {
      mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
    };
    const apiService = getApiService();
    setLoading(true);
    try {
      await apiService.otpVerification(payload);

      console.log('here');
      getAnalyticsService()
        .logEvent('login', {method: 'mobile'})
        .catch(handleError);
      setLoading(false);
      navigation.navigate('OTPVerification', {
        mobile: payload.mobile,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const navigation = useAppNavigation();

  return (
    <AuthView
      isLoading={loading}
      buttonTitle="Sign In"
      onSubmit={handleSubmit}
      showButton={false}
      header={{title: 'Sign In'}}
      heading="Get Started For Free"
      style={applyStyles('bg-white')}
      description="Log in to auto-backup and sync your data securely">
      <View style={applyStyles('pb-32')}>
        <PhoneNumberField
          errorMessage={errors.mobile}
          onSubmitEditing={handleSubmit}
          placeholder="Enter your number"
          label="What's your phone number?"
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          isInvalid={touched.mobile && !!errors.mobile}
          value={{number: values.mobile, callingCode: values.countryCode}}
        />
        <Button
          title="Sign In"
          isLoading={loading}
          onPress={handleSubmit}
          style={applyStyles('w-full')}
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
    </AuthView>
  );
};
