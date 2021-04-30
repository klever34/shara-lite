import React, {useCallback, useMemo} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {applyStyles, colors} from '@/styles';
import {Page} from '@/components/Page';
import {RouteProp} from '@react-navigation/native';
import {SecurityStackParamList} from '.';
import {getApiService, getAuthService, getI18nService} from '@/services';

const strings = getI18nService().strings;

type SecurityOptionsScreenProps = {
  route: RouteProp<SecurityStackParamList, 'SecurityOptions'>;
};

export const SecurityOptionsScreen = ({route}: SecurityOptionsScreenProps) => {
  const {pinSet} = route.params;
  const fromSecuritySettings = true;
  const navigation = useAppNavigation();
  const user = getAuthService().getUser();

  const setTransactionPin = useCallback(() => {
    navigation.navigate('SetTransactionPin');
  }, [navigation]);

  const changeTransactionPin = useCallback(() => {
    navigation.navigate('VerifyTransactionPin', {
      routeName: 'ChangeTransactionPin',
      fromSecuritySettings,
      heading: strings('withdrawal_pin.enter_new_transaction_pin'),
    });
  }, [fromSecuritySettings, navigation]);

  const changeSecurityQuestions = useCallback(() => {
    navigation.navigate('VerifyTransactionPin', {
      routeName: 'ChangeSecurityQuestions',
      fromSecuritySettings,
      heading: strings('withdrawal_pin.enter_new_transaction_pin'),
    });
  }, [fromSecuritySettings, navigation]);

  const newPin = !pinSet
    ? {
        leftSection: {
          title: strings(
            'withdrawal_pin.security_options.set_transaction_pin_title',
          ),
          caption: strings('withdrawal_pin.transaction_pin_caption'),
        },
        onPress: setTransactionPin,
      }
    : {
        leftSection: {
          title: strings(
            'withdrawal_pin.security_options.change_transaction_pin_title',
          ),
          caption: strings('withdrawal_pin.transaction_pin_caption'),
        },
        onPress: changeTransactionPin,
      };

  const notSetPin = pinSet && {
    leftSection: {
      title: strings(
        'withdrawal_pin.security_options.recover_transaction_pin_title',
      ),
      caption: strings('withdrawal_pin.transaction_pin_caption'),
    },
    onPress: async () => {
      if (!user) {
        return;
      }
      const {data: question} = await getApiService().getSecurityQuestions(
        user.id,
      );
      navigation.navigate('RecoverTransactionPin', question);
    },
  };

  const changeQuestions = pinSet && {
    leftSection: {
      title: strings('withdrawal_pin.recover_transaction_pin.page_title'),
      caption: 'Update your security questions',
    },
    onPress: changeSecurityQuestions,
  };

  const securityOptions = useMemo(() => {
    return [newPin, notSetPin, changeQuestions];
  }, [changeQuestions, newPin, notSetPin]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Page
        header={{
          title: strings('withdrawal_pin.security_settings'),
          style: applyStyles('py-8 mt-0'),
          iconLeft: {},
        }}
        style={applyStyles('px-0 pt-0')}>
        <View style={applyStyles('mb-24')}>
          {securityOptions.map(
            (option, index) =>
              option && (
                <TouchableActionItem
                  {...option}
                  key={`${index}`}
                  style={applyStyles('border-t-1 border-gray-20 px-16', {
                    borderBottomWidth: 1,
                    borderColor: colors['gray-20'],
                  })}
                />
              ),
          )}
        </View>
      </Page>
    </SafeAreaView>
  );
};
