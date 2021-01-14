import {AuthView, Button, PhoneNumber, PhoneNumberField} from '@/components';
import {getAnalyticsService, getApiService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
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

const i18nService = getI18nService();

type Fields = {
  mobile: string;
  countryCode: string;
};

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .min(5, i18nService.strings('alert.minimum_phone_digits'))
    .required(i18nService.strings('alert.required.number')),
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
  const onSubmit = async (data: Fields) => {
    const {mobile, countryCode} = data;
    if (!countryCode) {
      Alert.alert(
        i18nService.strings('alert.error'),
        i18nService.strings('alert.select_country'),
      );
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
      Alert.alert(i18nService.strings('alert.error'), error.message);
    }
  };

  useEffect(() => {
    RNOtpVerify.getHash()
      .then((text) => setHash(text[0]))
      .catch(handleError);
  }, []);

  return (
    <AuthView
      isLoading={loading}
      buttonTitle={i18nService.strings('login.login_button')}
      onSubmit={handleSubmit}
      showButton={false}
      header={{title: 'Sign In'}}
      heading={i18nService.strings('login.heading')}
      style={applyStyles('bg-white')}
      description={i18nService.strings('login.subheading')}>
      <View style={applyStyles('pb-32')}>
        <PhoneNumberField
          errorMessage={errors.mobile}
          onSubmitEditing={handleSubmit}
          placeholder={i18nService.strings('fields.phone.placeholder')}
          label={i18nService.strings('fields.phone.label')}
          containerStyle={applyStyles('mb-24')}
          onChangeText={(data) => onChangeMobile(data)}
          isInvalid={touched.mobile && !!errors.mobile}
          value={{number: values.mobile, callingCode: values.countryCode}}
        />
        <Button
          title={i18nService.strings('login.login_button')}
          isLoading={loading}
          onPress={handleSubmit}
          style={applyStyles('w-full')}
        />
      </View>
    </AuthView>
  );
};
