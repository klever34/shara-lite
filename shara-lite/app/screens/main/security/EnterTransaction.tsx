import Icon from '@/components/Icon';
import {Page} from '@/components/Page';
import {
  getApiService,
  getAuthService,
  getI18nService,
  getRemoteConfigService,
  getStorageService,
} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, Text, View} from 'react-native';
import {User} from 'types/app';
import {withModal} from '@/helpers/hocs';

const strings = getI18nService().strings;

export const EnterTransaction = withModal(({route: {params}}: any) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const authService = getAuthService();
  let user = authService.getUser() as User;
  const navigation = useAppNavigation();

  const heading = params && params.heading;

  const handlePinChange = useCallback((code) => {
    setPin(code);
  }, []);

  const handleSubmit = useCallback(
    async (pin: string) => {
      const apiService = getApiService();
      setLoading(true);
      setHasError(false);
      try {
        const payload = {pin};
        const {
          data: {token},
        } = await apiService.verifyTransactionPin(user.id.toString(), payload);
        if (params.routeName === 'DisbursementScreen') {
          const idValue = (async () =>
            await getStorageService().getItem('bvn'))();
          if (!user?.is_identity_verified) {
            const bvnVerificationEnabled = getRemoteConfigService()
              .getValue('enableBVNVerification')
              .asBoolean();
            if (idValue && !bvnVerificationEnabled) {
              navigation.navigate('DisbursementScreen');
            } else {
              navigation.navigate('PaymentSettings');
            }
          } else {
            navigation.navigate('DisbursementScreen');
          }
        } else {
          navigation.replace(params.routeName, {
            token,
            heading,
            status: true,
          });
        }
      } catch (error) {
        setPin('');
        setLoading(false);
        setHasError(true);
        Alert.alert(strings('alert.error'), error.message);
      }
    },
    [heading, navigation, params, user],
  );

  return (
    <Page
      header={{
        iconLeft: {},
        title: strings('withdrawal_pin.transaction_pin'),
        style: applyStyles('py-8'),
      }}
      style={applyStyles('px-0 py-32')}>
      <View style={applyStyles('center py-32')}>
        <Text
          style={applyStyles(
            'text-center text-black text-lg pt-16 px-8 mt-32',
          )}>
          {strings('withdrawal_pin.enter_transaction_pin.heading')}
        </Text>
        <View style={applyStyles('flex-row pt-8')}>
          <Icon
            size={18}
            name="lock"
            type="feathericons"
            color={colors['gray-100']}
          />
          <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
            {strings('withdrawal_pin.subHeading')}
          </Text>
        </View>
        <OTPInputView
          code={pin}
          pinCount={4}
          autoFocusOnLoad={true}
          secureTextEntry={true}
          onCodeFilled={handleSubmit}
          onCodeChanged={handlePinChange}
          style={applyStyles('flex-row center', {
            height: 100,
            width: 100,
          })}
          codeInputFieldStyle={applyStyles('w-20 h-45 text-black', {
            fontSize: 18,
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 4,
          })}
          codeInputHighlightStyle={applyStyles({
            borderColor: colors.primary,
          })}
        />
        {loading && <ActivityIndicator size={24} color={colors.primary} />}
        {hasError && (
          <Text style={applyStyles('text-red-100 text-sm text-400')}>
            {strings('withdrawal_pin.error_message')}
          </Text>
        )}
      </View>
    </Page>
  );
});