import {AuthView, Button, PhoneNumber, PhoneNumberField} from '@/components';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';
import RNOtpVerify from 'react-native-otp-verify';
import * as yup from 'yup';
import {strings} from '@/services/i18n';

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

  const navigation = useAppNavigation();
  const {errors, values, touched, handleSubmit, setFieldValue} = useFormik({
    validationSchema,
    initialValues: FormDefaults.get('login', {
      mobile: '',
      countryCode: callingCode,
    }) as Fields,
    onSubmit: (payload) => onSubmit(payload),
  });
  const [hash, setHash] = useState('');
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
    const apiService = getApiService();
    setLoading(true);
    try {
      const device_id = await getAndroidId();
      const payload = {
        hash,
        device_id,
        country_code: countryCode,
        mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
      };
      const message = await apiService.otp(payload);

      getAnalyticsService()
        .logEvent('login', {method: 'mobile'})
        .catch(handleError);
      setLoading(false);
      navigation.navigate('OTPVerification', {
        message,
        mobile: payload.mobile,
        countryCode: payload.country_code,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const getHash = () =>
    RNOtpVerify.getHash()
      .then((text) => setHash(text[0]))
      .catch(console.log);

  useEffect(() => {
    getHash();
  }, []);

  return (
    <AuthView
      isLoading={loading}
      buttonTitle={strings('login.login_button')}
      onSubmit={handleSubmit}
      showButton={false}
      header={{title: 'Sign In'}}
      heading={strings('login.heading')}
      style={applyStyles('bg-white')}
      description={strings('login.subheading')}>
      <View style={applyStyles('pb-32')}>
        <PhoneNumberField
          errorMessage={errors.mobile}
          onSubmitEditing={handleSubmit}
          placeholder={strings('fields.phone_field.placeholder')}
          label={strings('fields.phone_field.label')}
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          isInvalid={touched.mobile && !!errors.mobile}
          value={{number: values.mobile, callingCode: values.countryCode}}
        />
        <Button
          title={strings('login.login_button')}
          isLoading={loading}
          onPress={handleSubmit}
          style={applyStyles('w-full')}
        />
      </View>
    </AuthView>
  );
};
