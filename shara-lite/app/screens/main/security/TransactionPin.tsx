import {Page} from '@/components/Page';
import React, {useCallback, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {Icon} from '@/components/Icon';
import {getApiService, getAuthService} from '@/services';
import {User} from 'types/app';
import {useAppNavigation} from '@/services/navigation';

type SetTransactionPinProps = {
  pin: string;
  handlePinChange: (code: string) => void;
};

type ConfirmTransactionPinProps = {
  handleSubmit: (code: string) => void;
};

export const TransactionPin = () => {
  const [pin, setPin] = useState('');
  const [, setLoading] = useState(false);
  const authService = getAuthService();
  let user = authService.getUser() as User;
  const navigation = useAppNavigation();

  const handlePinChange = useCallback((code) => {
    setPin(code);
  }, []);

  const handleSubmit = useCallback(
    async (confirmPin: string) => {
      const apiService = getApiService();
      setLoading(true);
      try {
        const payload = {pin, confirm_pin: confirmPin};
        await apiService.setTransactionPin(user.id.toString(), payload);
        navigation.navigate('SuccessScreen');
      } catch (error) {
        setLoading(false);
        Alert.alert('error', error.message);
      }
    },
    [navigation, pin, user.id],
  );

  return (
    <Page
      header={{
        iconLeft: {},
        title: 'SECURITY',
        style: applyStyles('py-8'),
      }}
      style={applyStyles('px-0 py-32')}>
      {pin.length !== 4 ? (
        <SetTransactionPin pin={pin} handlePinChange={handlePinChange} />
      ) : (
        <ConfirmTransactionPin handleSubmit={handleSubmit} />
      )}
    </Page>
  );
};

const SetTransactionPin = (props: SetTransactionPinProps) => {
  const {pin, handlePinChange} = props;

  return (
    <View style={applyStyles('center py-32')}>
      <Text
        style={applyStyles('text-center text-black text-lg pt-16 px-8 mt-32')}>
        Set 4-digit PIN for all your transactions
      </Text>
      <View style={applyStyles('flex-row pt-8')}>
        <Icon
          size={18}
          name="lock"
          type="feathericons"
          color={colors['gray-100']}
        />
        <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
          All transactions are safe, secure and instant.
        </Text>
      </View>
      <OTPInputView
        code={pin}
        pinCount={4}
        autoFocusOnLoad={true}
        secureTextEntry={true}
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
    </View>
  );
};

const ConfirmTransactionPin = ({handleSubmit}: ConfirmTransactionPinProps) => {
  return (
    <View style={applyStyles('center py-32')}>
      <Text
        style={applyStyles('text-center text-black text-lg pt-16 px-8 mt-32')}>
        Confirm PIN
      </Text>
      <View style={applyStyles('flex-row pt-16')}>
        <Icon
          size={18}
          name="lock"
          type="feathericons"
          color={colors['gray-100']}
        />
        <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
          All transactions are safe, secure and instant.
        </Text>
      </View>
      <OTPInputView
        pinCount={4}
        autoFocusOnLoad={true}
        secureTextEntry={true}
        onCodeFilled={handleSubmit}
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
    </View>
  );
};
