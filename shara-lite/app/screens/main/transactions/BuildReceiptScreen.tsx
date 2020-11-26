import {AppInput, Button, PhoneNumberField, SecureEmblem} from '@/components';
import {Page} from '@/components/Page';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import {useFormik} from 'formik';
import React, {useCallback, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import * as yup from 'yup';

export type BusinessFormPayload = {
  name: string;
  address?: string;
  mobile?: string;
  countryCode?: string;
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Business name is required'),
  address: yup.string().required('Business address is required'),
});

export const BuildReceiptScreen = () => {
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();

  const apiService = getApiService();

  const [isLoading, setIsLoading] = useState(false);

  const {
    errors,
    values,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validationSchema,
    initialValues: {
      name: '',
      address: '',
      mobile: '',
      countryCode: callingCode,
    },
    onSubmit: (payload) => {
      const {countryCode, mobile, ...rest} = payload;
      onSubmit({
        mobile: `${countryCode}${mobile}`.replace(/\s/g, ''),
        countryCode,
        ...rest,
      });
    },
  });

  const onSkip = useCallback(() => {
    navigation.navigate('CreateReceipt', {});
  }, [navigation]);

  const onChangeMobile = useCallback(
    (value: {callingCode: string; number: string}) => {
      const {callingCode: code, number} = value;
      setFieldValue('countryCode', code);
      setFieldValue('mobile', number);
    },
    [setFieldValue],
  );

  const onSubmit = useCallback(
    async (data?: BusinessFormPayload) => {
      const payload = new FormData();
      payload.append('name', data?.name);
      payload.append('address', data?.address);
      data?.mobile && payload.append('mobile', data.mobile);
      setIsLoading(true);
      try {
        await apiService.businessSetup(payload);
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        setIsLoading(false);
        onSkip();
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', error.message);
      }
    },
    [onSkip, apiService, handleError],
  );

  return (
    <Page
      header={{title: 'Setup', iconRight: {iconName: 'x', onPress: onSkip}}}
      footer={
        <View>
          <View style={applyStyles('flex-row justify-between items-center')}>
            <View style={applyStyles({width: '48%'})}>
              <Button
                title="Skip"
                onPress={onSkip}
                variantColor="transparent"
              />
            </View>
            <View style={applyStyles({width: '48%'})}>
              <Button
                title="Done"
                variantColor="red"
                isLoading={isLoading}
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      }>
      <View style={applyStyles('center pt-24 pb-32 px-32')}>
        <Text
          style={applyStyles(
            'text-2xl pb-8 text-700 text-center text-gray-300',
          )}>
          Build Your Receipt
        </Text>
        <Text style={applyStyles('text-400 text-center text-sm text-gray-300')}>
          You might want some information about your business to appear on your
          Receipt. You can fill them below.
        </Text>
      </View>
      <View style={applyStyles('pb-16')}>
        <AppInput
          rightIcon="home"
          value={values.name}
          errorMessage={errors.name}
          onChangeText={handleChange('name')}
          label="What's the name of your business?"
          isInvalid={touched.name && !!errors.name}
          placeholder="Enter your business name here"
        />
      </View>
      <View style={applyStyles('pb-16')}>
        <PhoneNumberField
          errorMessage={errors.mobile}
          label="What's your business phone number?"
          placeholder="Enter your phone number here"
          isInvalid={touched.mobile && !!errors.mobile}
          onChangeText={(data) => onChangeMobile(data)}
          value={{
            number: values.mobile ?? '',
            callingCode: values.countryCode ?? callingCode,
          }}
        />
      </View>
      <View style={applyStyles('pb-16')}>
        <AppInput
          rightIcon="map-pin"
          value={values.address}
          errorMessage={errors.address}
          onChangeText={handleChange('address')}
          placeholder="Enter your address here"
          label="where is your business located?"
          isInvalid={touched.address && !!errors.address}
        />
      </View>
      <View style={applyStyles('flex-row center pt-32')}>
        <SecureEmblem />
      </View>
    </Page>
  );
};
