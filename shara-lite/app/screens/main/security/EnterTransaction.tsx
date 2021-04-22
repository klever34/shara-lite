import Icon from '@/components/Icon';
import {Page} from '@/components/Page';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {User} from 'types/app';
import {SuccessScreen} from './SuccessScreen';
import {withModal} from '@/helpers/hocs';
import {Button} from '@/components';

export const EnterTransaction = withModal(
  ({route: {params}, closeModal, openModal}: any) => {
    const [pin, setPin] = useState('');
    const [, setLoading] = useState(false);
    const authService = getAuthService();
    let user = authService.getUser() as User;
    const navigation = useAppNavigation();

    const handlePinChange = useCallback((code) => {
      setPin(code);
    }, []);

    const handleSubmit = useCallback(
      async (pin: string) => {
        const apiService = getApiService();
        setLoading(true);
        try {
          const payload = {pin};
          const {
            data: {token},
          } = await apiService.verifyTransactionPin(
            user.id.toString(),
            payload,
          );
          if (params && params.question && params.answer) {
            const securityQuestionsPayload = {
              user_id: user.id,
              token: token,
              answer: params.answer,
              question: params.question,
            };
            await apiService.setSecurityQuestions(securityQuestionsPayload);
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
                        style={applyStyles('mt-32', {width: '45%'})}
                        onPress={() => {
                          closeModal();
                          onCloseModal();
                        }}
                      />
                    </View>
                  )}
                />
              ),
            });
          } else if (params && params.fromSecuritySettings) {
            navigation.navigate('ChangeTransactionPin', {token});
          } else {
            navigation.navigate('DisburementScreen');
          }
        } catch (error) {
          setLoading(false);
          Alert.alert('error', error.message);
        }
      },
      [closeModal, navigation, openModal, params, user.id],
    );

    return (
      <Page
        header={{
          iconLeft: {},
          title: 'Set TRANSACTION PIN',
          style: applyStyles('py-8'),
        }}
        style={applyStyles('px-0 py-32')}>
        <View style={applyStyles('center py-32')}>
          <Text
            style={applyStyles(
              'text-center text-black text-lg pt-16 px-8 mt-32',
            )}>
            Enter Tranaction PIN her
          </Text>
          <View style={applyStyles('flex-row pt-8')}>
            <Icon
              size={18}
              name="lock"
              type="feathericons"
              color={colors['gray-100']}
            />
            <Text
              style={applyStyles('text-center text-gray-100 text-base px-6')}>
              All transactions are safe, secure and instant.
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
        </View>
      </Page>
    );
  },
);
