import {Page} from '@/components/Page';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Text, View} from 'react-native';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {Icon} from '@/components/Icon';
import {TransactionPinSuccessScreen} from './TransactionPinSuccessScreen';
import {withModal} from '@/helpers/hocs';
import {useAppNavigation} from '@/services/navigation';
import {Button} from '@/components';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;
type ConfirmTransactionPinProps = {
  handleSubmit?: (code: string) => void;
  heading?: any;
  subHeading?: any;
  pin?: any;
  handlePinChange?: (code: string) => void;
  loading?: boolean;
  hasError?: boolean;
};

export const TransactionPin = withModal(
  ({
    enterProps,
    confirmProps,
    openModal,
    closeModal,
    onSubmit,
    title,
    hideButton,
  }: any) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [section, setSection] = useState(0);
    const navigation = useAppNavigation();

    const handlePinChange = useCallback((code) => {
      setPin(code);
    }, []);

    const handleEnterPinSubmit = useCallback((code) => {
      setPin(code);
      setSection(1);
    }, []);

    const onError = useCallback(() => {
      setPin('');
      setSection(0);
      setLoading(false);
      setHasError(true);
    }, []);

    const onSuccess = useCallback(() => {
      const onCloseModal = openModal('full', {
        renderContent: () => (
          <TransactionPinSuccessScreen
            renderButtons={() => (
              <View
                style={applyStyles(
                  'mt-64 pt-64 flex-row items-center justify-around',
                )}>
                <Button
                  title={strings('done')}
                  style={applyStyles('mt-32', {width: '45%'})}
                  onPress={() => {
                    closeModal();
                    onCloseModal();
                    navigation.navigate('SecuritySettings');
                  }}
                />
              </View>
            )}
          />
        ),
      });
    }, [closeModal, navigation, openModal]);

    const handleSubmit = useCallback(
      async (confirmPin: string) => {
        setLoading(true);
        setHasError(false);
        try {
          await onSubmit({pin, confirmPin}, onError, onSuccess);
        } catch (error) {
          setPin('');
          setHasError(true);
          setLoading(false);
          navigation.navigate('ChangeTransactionPin');
          Alert.alert(strings('alert.error'), error.message);
        }
      },
      [navigation, onError, onSubmit, onSuccess, pin],
    );

    return (
      <Page
        header={{
          iconLeft: {},
          title: title,
          style: applyStyles('py-8'),
        }}
        style={applyStyles('px-0 py-32')}>
        {section === 0 ? (
          <EnterTransactionPin
            pin={pin}
            loading={loading}
            hasError={hasError}
            handlePinChange={handlePinChange}
            heading={strings('withdrawal_pin.create_transaction_pin.heading')}
            subHeading={strings('withdrawal_pin.subHeading')}
            handleSubmit={handleEnterPinSubmit}
            {...enterProps}
          />
        ) : (
          <ConfirmTransactionPin
            loading={loading}
            hasError={hasError}
            heading={strings('withdrawal_pin.confirm_transaction_pin_heading')}
            subHeading={strings('withdrawal_pin.subHeading')}
            handleSubmit={handleSubmit}
            {...confirmProps}
          />
        )}
      </Page>
    );
  },
);

export const EnterTransactionPin = ({
  handleSubmit,
  heading,
  subHeading,
  pin: pinProp,
  handlePinChange,
  loading,
  hasError,
}: ConfirmTransactionPinProps) => {
  const [pin, setPin] = useState(pinProp || '');
  const [autoFocusOnLoad, setAutoFocusOnLoad] = useState(true);

  const onPinChange = useCallback(
    (code) => {
      setPin(code);
      handlePinChange?.(code);
    },
    [handlePinChange],
  );

  useEffect(() => {
    setPin(pinProp);
    setAutoFocusOnLoad(true);
  }, [pinProp]);

  console.log(autoFocusOnLoad);

  return (
    <View style={applyStyles('center py-32')}>
      <Text
        style={applyStyles('text-center text-black text-lg pt-16 px-8 mt-32')}>
        {heading}
      </Text>
      <View style={applyStyles('flex-row pt-16')}>
        <Icon
          size={18}
          name="lock"
          type="feathericons"
          color={colors['gray-100']}
        />
        <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
          {subHeading}
        </Text>
      </View>
      <OTPInputView
        code={pin}
        pinCount={4}
        secureTextEntry={true}
        onCodeChanged={onPinChange}
        onCodeFilled={handleSubmit}
        autoFocusOnLoad={autoFocusOnLoad}
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
  );
};

export const ConfirmTransactionPin = ({
  handleSubmit,
  heading,
  subHeading,
  pin: pinProp,
  handlePinChange,
  loading,
  hasError,
}: ConfirmTransactionPinProps) => {
  const [pin, setPin] = useState(pinProp || '');
  const [autoFocusOnLoad, setAutoFocusOnLoad] = useState(true);

  const onPinChange = useCallback(
    (code) => {
      setPin(code);
      handlePinChange?.(code);
    },
    [handlePinChange],
  );

  useEffect(() => {
    setPin(pinProp);
    setAutoFocusOnLoad(true);
  }, [pinProp]);

  console.log(autoFocusOnLoad);

  return (
    <View style={applyStyles('center py-32')}>
      <Text
        style={applyStyles('text-center text-black text-lg pt-16 px-8 mt-32')}>
        {heading}
      </Text>
      <View style={applyStyles('flex-row pt-16')}>
        <Icon
          size={18}
          name="lock"
          type="feathericons"
          color={colors['gray-100']}
        />
        <Text style={applyStyles('text-center text-gray-100 text-base px-6')}>
          {subHeading}
        </Text>
      </View>
      <OTPInputView
        code={pin}
        pinCount={4}
        secureTextEntry={true}
        onCodeChanged={onPinChange}
        onCodeFilled={handleSubmit}
        autoFocusOnLoad={autoFocusOnLoad}
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
  );
};
