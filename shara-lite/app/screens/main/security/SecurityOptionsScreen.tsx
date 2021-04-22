import React, {useCallback, useMemo} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {applyStyles, colors} from '@/styles';
import {Page} from '@/components/Page';
import {RouteProp} from '@react-navigation/native';
import {SecurityStackParamList} from '.';

type SecurityOptionsScreenProps = {
  route: RouteProp<SecurityStackParamList, 'SecurityOptions'>;
};

export const SecurityOptionsScreen = ({route}: SecurityOptionsScreenProps) => {
  const {pinSet} = route.params;
  const navigation = useAppNavigation();

  const setTransactionPin = useCallback(() => {
    navigation.navigate('SetTransactionPin');
  }, [navigation]);

  const securityQuestions = useCallback(() => {
    navigation.navigate('SecurityQuestions');
  }, [navigation]);

  const changeTransactionPin = useCallback(() => {
    navigation.navigate('ChangeTransactionPin');
  }, [navigation]);

  const recoverTransactionPin = useCallback(() => {
    navigation.navigate('RecoverTransactionPin');
  }, [navigation]);

  const newPin = !pinSet
    ? {
        leftSection: {
          title: 'Set Transaction PIN',
          caption: 'View and update your personal information',
        },
        onPress: setTransactionPin,
      }
    : {
        leftSection: {
          title: 'Change Transaction PIN',
          caption: 'View and update your personal information',
        },
        onPress: changeTransactionPin,
      };

  const securityOptions = useMemo(() => {
    return [
      newPin,
      {
        leftSection: {
          title: 'Security Questions',
          caption: 'View and edit your business information',
        },
        onPress: securityQuestions,
      },
      {
        leftSection: {
          title: 'Recover PIN',
          caption: 'View and update your personal information',
        },
        onPress: recoverTransactionPin,
      },
    ];
  }, [newPin, recoverTransactionPin, securityQuestions]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Page
        header={{
          title: 'SECURITY',
          style: applyStyles('py-8 mt-0'),
          iconLeft: {},
        }}
        style={applyStyles('px-0 pt-0')}>
        <View style={applyStyles('mb-24')}>
          {securityOptions.map((option, index) => {
            return (
              <TouchableActionItem
                {...option}
                key={`${index}`}
                style={applyStyles(
                  'border-t-1 border-gray-20 px-16',
                  {
                    borderTopWidth: 1,
                    borderColor: colors['gray-20'],
                  },
                  index === securityOptions.length - 1 && {
                    borderBottomWidth: 1,
                  },
                )}
              />
            );
          })}
        </View>
      </Page>
    </SafeAreaView>
  );
};
