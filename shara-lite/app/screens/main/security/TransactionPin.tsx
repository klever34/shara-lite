import {Page} from '@/components/Page';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {Icon} from '@/components/Icon';
import {SuccessScreen} from './SuccessScreen';
import {withModal} from '@/helpers/hocs';
import {useAppNavigation} from '@/services/navigation';
import {Button} from '@/components';

type ConfirmTransactionPinProps = {
  handleSubmit?: (code: string) => void;
  heading?: any;
  subHeading?: any;
  pin?: any;
  handlePinChange?: (code: string) => void;
};

export const TransactionPin = withModal(
  ({enterProps, confirmProps, openModal, closeModal, onSubmit}: any) => {
    const [pin, setPin] = useState('');
    const [, setLoading] = useState(false);
    const [section, setSection] = useState(0);
    const navigation = useAppNavigation();

    const handlePinChange = useCallback((code) => {
      setPin(code);
    }, []);

    const handleEnterPinSubmit = useCallback((code) => {
      setPin(code);
      setSection(1);
    }, []);

    const handleSubmit = useCallback(
      async (confirmPin: string) => {
        setLoading(true);
        try {
          await onSubmit({pin, confirmPin});
          const onCloseModal = openModal('full', {
            renderContent: () => (
              <SuccessScreen
                renderButtons={() => (
                  <View
                    style={applyStyles(
                      'mt-64 pt-64 flex-row items-center justify-around',
                    )}>
                    <Button
                      title={'done'}
                      variantColor="transparent"
                      style={applyStyles('mt-32', {width: '45%'})}
                      onPress={() => {
                        closeModal();
                        onCloseModal();
                      }}
                    />
                    <Button
                      title={'Security question'}
                      style={applyStyles('mt-32', {width: '45%'})}
                      onPress={() => {
                        navigation.navigate('SecurityQuestions');
                      }}
                    />
                  </View>
                )}
              />
            ),
          });
        } catch (error) {
          setLoading(false);
          Alert.alert('error', error.message);
        }
      },
      [closeModal, navigation, onSubmit, openModal, pin],
    );

    return (
      <Page
        header={{
          iconLeft: {},
          title: 'SECURITY',
          style: applyStyles('py-8'),
        }}
        style={applyStyles('px-0 py-32')}>
        {section === 0 ? (
          <EnterTransactionPin
            pin={pin}
            handlePinChange={handlePinChange}
            heading={'Set 4-digit PIN for all your transactions'}
            subHeading={'All transactions are safe, secure and instant.'}
            handleSubmit={handleEnterPinSubmit}
            {...enterProps}
          />
        ) : (
          <EnterTransactionPin
            heading={'Confirm PIN'}
            subHeading={'All transactions are safe, secure and instant.'}
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
}: ConfirmTransactionPinProps) => {
  const [pin, setPin] = useState(pinProp || '');

  const onPinChange = useCallback(
    (code) => {
      setPin(code);
      handlePinChange?.(code);
    },
    [handlePinChange],
  );

  useEffect(() => {
    setPin(pinProp);
  }, [pinProp]);

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
        autoFocusOnLoad={true}
        secureTextEntry={true}
        onCodeChanged={onPinChange}
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
