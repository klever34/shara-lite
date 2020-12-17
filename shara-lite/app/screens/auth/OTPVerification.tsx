import {AuthView, Button} from '@/components';
import {getAnalyticsService, getApiService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useInitRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import {RouteProp, useRoute} from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';
import RNOtpVerify from 'react-native-otp-verify';
import {AuthStackParamList} from '.';

export const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const {params} = useRoute<RouteProp<AuthStackParamList, 'OTPVerification'>>();

  const {initRealm} = useInitRealm();
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();

  const handleOtpChange = React.useCallback((code) => {
    setOtp(code);
  }, []);

  const handleSubmit = useCallback(
    async (code) => {
      if (code) {
        const device_id = await getAndroidId();
        const payload = {
          otp: code,
          device_id,
          mobile: params.mobile,
        };
        const apiService = getApiService();
        setLoading(true);
        try {
          await apiService.otpVerification(payload);
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
      }
    },
    [handleError, initRealm, navigation, params.mobile],
  );

  const getHash = () =>
    RNOtpVerify.getHash().then(console.log).catch(console.log);

  useEffect(() => {
    getHash();

    RNOtpVerify.getOtp()
      .then(() => {
        RNOtpVerify.addListener((message) => {
          try {
            if (message) {
              //@ts-ignore
              const code = /(\d{6})/g.exec(message)[1];
              setOtp(code);
            }
          } catch (error) {
            console.log(
              error.message,
              'RNOtpVerify.getOtp - read message, OtpVerification',
            );
          }
        });
      })
      .catch((error) => {
        console.log(error.message, 'RNOtpVerify.getOtp, OtpVerification');
      });

    // remove listener on unmount
    return () => {
      RNOtpVerify.removeListener();
    };
  }, []);

  useEffect(() => {
    if (otp) {
      handleSubmit(otp);
    }
  }, [handleSubmit, otp]);

  return (
    <AuthView
      heading="OTP"
      description={
        'We’ve sent a one-time password to your phone.\n Please enter it below'
      }>
      <View style={applyStyles('items-center')}>
        <OTPInputView
          code={otp}
          pinCount={6}
          autoFocusOnLoad={true}
          placeholderCharacter="•"
          style={applyStyles({
            width: '80%',
            height: 100,
          })}
          onCodeFilled={handleSubmit}
          placeholderTextColor="#C4C4C4"
          onCodeChanged={handleOtpChange}
          codeInputFieldStyle={applyStyles('w-45 h-45 text-black', {
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
          })}
          codeInputHighlightStyle={applyStyles({
            borderColor: colors.primary,
          })}
        />
        <View style={applyStyles('mb-24')}>
          <TouchableOpacity
            style={applyStyles('flex-row center')}
            onPress={() => {}}>
            <Text style={applyStyles('text-gray-100 text-base')}>
              Didn't receive the code?{' '}
            </Text>
            <Text
              style={applyStyles({
                fontSize: 16,
                color: colors.black,
                textDecorationStyle: 'solid',
                textDecorationLine: 'underline',
                textDecorationColor: colors.black,
              })}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          variantColor="red"
          title="Get Started"
          isLoading={loading}
          style={applyStyles('w-full')}
        />
      </View>
    </AuthView>
  );
};
