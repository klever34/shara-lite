import {AuthView, Button, PasswordField, PhoneNumberField} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {initLocalRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {colors} from '@/styles';
import {useFormik} from 'formik';
import React, {useContext, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as yup from 'yup';
import {getAnalyticsService, getApiService, getRealmService} from '@/services';

type Fields = {
  mobile: string;
  password: string;
  countryCode: string;
};

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .length(5, 'Number should be 5 digits')
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
    <AuthView title="Welcome Back!" description="Sign in to your account.">
      <View style={styles.form}>
        <View style={styles.inputField}>
          <PhoneNumberField
            errorMessage={errors.mobile}
            isInvalid={touched.mobile && !!errors.mobile}
            onChangeText={(data) => onChangeMobile(data)}
            value={{number: values.mobile, code: values.countryCode}}
          />
        </View>
        <View style={styles.inputField}>
          <PasswordField
            value={values.password}
            errorMessage={errors.password}
            onChangeText={handleChange('password')}
            isInvalid={touched.password && !!errors.password}
          />
        </View>
        <Button
          title="Continue"
          variantColor="red"
          onPress={handleSubmit}
          isLoading={loading}
        />
      </View>
      <View style={applyStyles('mb-16')}>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() =>
            navigation.navigate('ForgotPassword', {
              mobile: {number: values.mobile, code: values.countryCode},
            })
          }>
          <Text style={styles.helpSectionText}>Forgot your password? </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => navigation.replace('Register')}>
          <Text style={styles.helpSectionText}>Don’t have an account? </Text>
          <Text style={styles.helpSectionButtonText}>Sign Up</Text>
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
    marginBottom: 16,
  },
  headerSection: {
    marginBottom: 48,
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
    marginBottom: 24,
  },
  helpSection: {
    marginBottom: 20,
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
});
