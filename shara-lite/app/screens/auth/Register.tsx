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
  getI18nService,
  getStorageService,
} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
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
import {getAndroidId} from 'react-native-device-info';

const i18nService = getI18nService();

type Fields = {
  mobile: string;
  password: string;
  countryCode: string;
  confirmPassword?: string;
};

export const Register = () => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        mobile: yup
          .string()
          .min(5, 'Number should be minimum of 5 digits')
          .required(i18nService.strings('alert.required.number')),
        password: yup
          .string()
          .oneOf(
            [yup.ref('confirmPassword'), undefined],
            i18nService.strings('alert.password_match'),
          )
          .required(i18nService.strings('alert.required.password')),
        confirmPassword: yup
          .string()
          .oneOf(
            [yup.ref('password'), undefined],
            i18nService.strings('alert.password_match'),
          )
          .required(i18nService.strings('alert.required.password')),
      }),
    [],
  );
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
      Alert.alert(
        i18nService.strings('alert.error'),
        i18nService.strings('alert.select_country'),
      );
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
      const device_id = await getAndroidId();
      await apiService.register({...payload, device_id});
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
      Alert.alert(i18nService.strings('alert.error'), error.message);
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
      header={{title: i18nService.strings('register.header')}}
      isLoading={loading}
      buttonTitle={i18nService.strings('register.submit_button')}
      onSubmit={handleSubmit}
      heading={i18nService.strings('register.heading')}
      showButton={false}
      style={applyStyles('bg-white')}
      description={i18nService.strings('register.subheading')}>
      <View>
        <View style={applyStyles('pb-16')}>
          <PhoneNumberField
            errorMessage={errors.mobile}
            placeholder={i18nService.strings('fields.phone.placeholder')}
            label={i18nService.strings('fields.phone.label')}
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
            label={i18nService.strings('fields.password.label')}
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
            label={i18nService.strings('fields.confirm_password.label')}
            errorMessage={errors.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            onSubmitEditing={handleSubmit}
          />
          <Button
            variantColor="red"
            onPress={handleSubmit}
            title={i18nService.strings('register.submit_button')}
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
            {i18nService.strings('register.have_account')}{' '}
          </Text>
          <Text style={styles.helpSectionButtonText}>
            {i18nService.strings('register.sign_in')}
          </Text>
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
