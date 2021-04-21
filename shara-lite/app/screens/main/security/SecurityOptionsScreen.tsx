import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {applyStyles, colors} from '@/styles';
import {Page} from '@/components/Page';
import {getApiService, getAuthService} from '@/services';
import {Alert} from 'react-native';
import {User} from 'types/app';

export const SecurityOptionsScreen = () => {
  const navigation = useAppNavigation();
  const [, setLoading] = useState(false);
  const authService = getAuthService();
  let user = authService.getUser() as User;

  const setTransactionPin = useCallback(() => {
    navigation.navigate('SetTransactionPin');
  }, [navigation]);

  const securityQuestions = useCallback(() => {
    navigation.navigate('SecurityQuestions');
  }, [navigation]);

  useEffect(() => {
    const apiService = getApiService();
    async function fetchData() {
      try {
        const res = await apiService.transactionPin(user.id);
        setLoading(true);
      } catch (error) {
        setLoading(false);
        Alert.alert('error', error.message);
      }
    }
    fetchData();
  }, [user.id]);

  const securityOptions = useMemo(() => {
    return [
      {
        leftSection: {
          title: 'Set Transaction PIN',
          caption: 'View and update your personal information',
        },
        onPress: setTransactionPin,
      },
      {
        leftSection: {
          title: 'Security Questions',
          caption: 'View and edit your business information',
        },
        onPress: securityQuestions,
      },
    ];
  }, [securityQuestions, setTransactionPin]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Page
        header={{
          title: 'SECURITY',
          style: applyStyles('py-8'),
          iconLeft: {},
        }}
        style={applyStyles('px-0')}>
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
