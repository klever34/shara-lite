import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {TransactionsScreen} from '@/screens/main/transactions';
import {applySpacing, applyStyles, colors, navBarHeight} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useContext, useEffect, useMemo} from 'react';
import {SetPinModal, Text} from '@/components';
import {Image, SafeAreaView, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {useInfo} from '@/helpers/hooks';
import {
  getApiService,
  getAuthService,
  getI18nService,
  getRemoteConfigService,
} from '@/services';
import {EntryContext} from '@/components/EntryView';
import Touchable from '@/components/Touchable';
import {useLastSeen} from '@/services/last-seen';
import {MoneyScreen} from './money';
import {MoreScreen} from './more';
import {withModal} from '@/helpers/hocs';
import {version as currentVersion} from '../../../package.json';

const strings = getI18nService().strings;

export type MainNavParamList = {
  TransactionsTab: undefined;
  MoneyTab: undefined;
  EntryTab: undefined;
  CustomersTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

export const useSharaMoney = () => {
  const enableSharaMoney = useMemo(() => {
    try {
      const sharaMoneyEnabledUsers = JSON.parse(
        getRemoteConfigService().getValue('sharaMoneyEnabledUsers').asString(),
      );
      if (!Object.keys(sharaMoneyEnabledUsers).length) {
        return true;
      }
      const user = getAuthService().getUser();
      return !!sharaMoneyEnabledUsers[user?.id ?? ''];
    } catch (e) {
      return false;
    }
  }, []);
  return {enableSharaMoney};
};

export const HomeScreen = withModal(({openModal, closeModal}) => {
  const {enableSharaMoney} = useSharaMoney();
  const navigation = useAppNavigation();
  const business = useInfo(() => getAuthService().getBusinessInfo());
  const {setCurrentCustomer} = useContext(EntryContext);
  const headerImageSource = business.profile_image?.url
    ? {
        uri: business.profile_image?.url,
      }
    : require('@/assets/images/shara_logo_white.png');
  const {updateLastSeen} = useLastSeen();

  useEffect(() => {
    setCurrentCustomer?.(null);
  }, [setCurrentCustomer]);

  const handleSetWithdrawalPin = () => {
    navigation.navigate('SecuritySettings', {pinSet: false});
  };

  let transactionPinVersion = getRemoteConfigService()
    .getValue('transactionPinVersion')
    .asString();

  const shouldShowSetPinModal = useMemo(() => {
    if (!transactionPinVersion || !currentVersion) {
      return false;
    }
    const [transactionPinVersionNumber] = transactionPinVersion.split('-');
    const [currentVersionNumber] = currentVersion.split('-');
    let [
      transactionPinMajor,
      transactionPinMinor,
      transactionPinPatch,
    ] = transactionPinVersionNumber.split('.');
    let [major, minor, patch] = currentVersionNumber.split('.');
    if (Number(transactionPinMajor) !== Number(major)) {
      return Number(major) < Number(transactionPinMajor);
    } else if (Number(transactionPinMinor) !== Number(minor)) {
      return Number(minor) < Number(transactionPinMinor);
    } else if (Number(transactionPinPatch) !== Number(patch)) {
      return Number(patch) < Number(transactionPinPatch);
    }
    return false;
  }, []);

  useEffect(() => {
    const handleShowTransactionPinModal = async () => {
      const user = getAuthService().getUser();
      if (!user) {
        return;
      }
      try {
        const {data: pinSet} = await getApiService().transactionPin(user?.id);
        if (!pinSet && shouldShowSetPinModal) {
          openModal('full', {
            renderContent: () => (
              <SetPinModal
                onSkip={closeModal}
                onSetWithdrawalPin={handleSetWithdrawalPin}
              />
            ),
          });
        }
      } catch (error) {}
    };
    handleShowTransactionPinModal();
  }, []);

  navigation.addListener('focus', () => {
    setCurrentCustomer?.(null);
    updateLastSeen();
  });

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View
        style={applyStyles(
          'flex-row py-16 bg-white relative items-center bg-primary',
        )}>
        <Touchable onPress={() => navigation.navigate('BusinessSettings')}>
          <View style={applyStyles('flex-row items-center ml-16')}>
            <Image
              resizeMode={business.profile_image?.url ? undefined : 'contain'}
              source={headerImageSource}
              style={applyStyles('w-full rounded-24', {
                width: applySpacing(24),
                height: applySpacing(24),
              })}
            />
            <View style={applyStyles('pl-12')}>
              <Text
                style={applyStyles(
                  'text-uppercase text-base text-700 text-white',
                )}>
                {business.name || strings('home_screen_setup_business_text')}
              </Text>
            </View>
          </View>
        </Touchable>
      </View>

      <MainNav.Navigator
        initialRouteName="TransactionsTab"
        tabBarOptions={{
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors.primary,
          inactiveTintColor: colors['gray-50'],
          style: applyStyles({height: navBarHeight}),
          tabStyle: applyStyles('py-20'),
          iconStyle: applyStyles('py-4'),
          keyboardHidesTabBar: true,
        }}>
        <MainNav.Screen
          name="TransactionsTab"
          component={TransactionsScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>{strings('home')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="material-icons" name="home" size={28} color={color} />
            ),
          }}
        />
        <MainNav.Screen
          name="CustomersTab"
          component={CustomersScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>
                {strings('client', {count: 2})}
              </TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon
                type="material-icons"
                name="people"
                size={28}
                color={color}
              />
            ),
          }}
        />
        {enableSharaMoney && (
          <MainNav.Screen
            name="MoneyTab"
            component={MoneyScreen}
            options={{
              tabBarLabel: (labelProps) => (
                <TabBarLabel {...labelProps}>{strings('money')}</TabBarLabel>
              ),
              tabBarIcon: ({color}) => (
                <Icon
                  type="material-icons"
                  name="attach-money"
                  size={28}
                  color={color}
                />
              ),
            }}
          />
        )}
        <MainNav.Screen
          name="MoreTab"
          component={MoreScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>{strings('more_text')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="material-icons" name="menu" size={28} color={color} />
            ),
          }}
        />
      </MainNav.Navigator>
    </SafeAreaView>
  );
});
