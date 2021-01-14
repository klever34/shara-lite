import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, Image, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {Icon} from '@/components/Icon';
import {applyStyles, colors, dimensions} from '@/styles';
import {getAnalyticsService, getAuthService, getI18nService} from '@/services';
import Touchable from '@/components/Touchable';
import {useErrorHandler} from '@/services/error-boundary';
import {version} from '../../../../package.json';
import {MoreStackParamList} from '.';
import {MainStackParamList} from '..';
import {useRealmLogout} from '@/services/realm';
import {SecureEmblem} from '@/components';
import {ShareHookProps, useShare} from '@/services/share';
import {inviteImageBase64String} from './inviteImageBase64String';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {useSyncChecks} from '@/services/realm/hooks/use-sync-checks';
import {TitleContainer} from '@/components/TitleContainer';
import {HeaderBackButton} from '@/components/HeaderBackButton';

const i18nService = getI18nService();

export const MoreOptionsScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const navigation = useAppNavigation<
      MainStackParamList & MoreStackParamList
    >();
    const shareProps: ShareHookProps = {
      image: inviteImageBase64String,
      recipient: '0',
      title: 'Invite Your Friends',
      subject: 'Invite Your Friends',
      message:
        'Download Shara to keep track of who owes you and get paid faster.\nClick https://bit.ly/shara-lite',
    };
    const {handleWhatsappShare} = useShare(shareProps);
    const {hasAllRecordsBeenSynced} = useSyncChecks();

    useLayoutEffect(() => {
      navigation.setOptions({
        header: () => null,
      });
    }, [navigation]);

    const onEditBusinessSettings = useCallback(() => {
      navigation.navigate('BusinessSettings');
    }, [navigation]);

    const PaymentSettings = useCallback(() => {
      navigation.navigate('PaymentSettings');
    }, [navigation]);

    const moreOptions = useMemo(() => {
      return [
        {
          title: i18nService.strings('more.list.profile_settings.title'),
          text: i18nService.strings('more.list.profile_settings.description'),
          onPress: () => {
            navigation.navigate('UserProfileSettings');
          },
        },
        {
          title: i18nService.strings('more.list.business_settings.title'),
          text: i18nService.strings('more.list.business_settings.description'),
          onPress: onEditBusinessSettings,
        },
        {
          title: i18nService.strings('more.list.payment_settings.title'),
          text: i18nService.strings('more.list.payment_settings.description'),
          onPress: PaymentSettings,
        },
        {
          title: i18nService.strings('more.list.referral.title'),
          text: i18nService.strings('more.list.referral.description'),
          onPress: () => {
            navigation.navigate('Referral');
          },
        },
        {
          title: i18nService.strings('more.list.feedback.title'),
          text: i18nService.strings('more.list.feedback.description'),
          onPress: () => {
            Alert.alert('Coming Soon', 'This feature is coming soon');
          },
        },
      ];
    }, [navigation, onEditBusinessSettings, PaymentSettings]);

    const {logoutFromRealm} = useRealmLogout();
    const handleError = useErrorHandler();

    const handleInviteFriends = useCallback(() => {
      getAnalyticsService()
        .logEvent('share', {
          method: 'whatsapp',
          content_type: 'invite-friend',
          item_id: '',
        })
        .then(() => {});
      getAnalyticsService()
        .logEvent('friendInvited', {})
        .then(() => {});
      handleWhatsappShare();
    }, [handleWhatsappShare]);

    const handleLogout = useCallback(async () => {
      try {
        const authService = getAuthService();
        await authService.logOut();
        getAnalyticsService().logEvent('logout', {}).catch(handleError);
        navigation.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        });
        logoutFromRealm();
      } catch (e) {
        handleError(e);
      }
    }, [handleError, navigation, logoutFromRealm]);

    const handleLogoutConfirm = useCallback(async () => {
      const closeLoadingModal = openModal('loading', {
        text: i18nService.strings('more.logout.logout_data_verification_text'),
      });
      const {isSynced} = await hasAllRecordsBeenSynced();
      closeLoadingModal();

      const message = isSynced
        ? i18nService.strings('more.logout.logout_confirmation_text')
        : i18nService.strings('more.logout.logout_unsaved_data_text');

      Alert.alert('Warning', message, [
        {
          text: i18nService.strings('more.no'),
          onPress: () => {},
        },
        {
          text: i18nService.strings('more.yes'),
          onPress: handleLogout,
        },
      ]);
    }, [handleLogout, openModal, hasAllRecordsBeenSynced]);

    const [business, setBusiness] = useState(
      getAuthService().getBusinessInfo(),
    );

    useEffect(() => {
      return navigation.addListener('focus', () => {
        setBusiness(getAuthService().getBusinessInfo());
      });
    }, [navigation]);

    return (
      <SafeAreaView style={applyStyles('flex-1')}>
        <View
          style={applyStyles(
            'flex-row py-8 pr-16 bg-white items-center justify-between',
            {
              borderBottomWidth: 1.5,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <HeaderBackButton
            iconName="arrow-left"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
        <ScrollView>
          <View
            style={applyStyles(
              {minHeight: dimensions.fullHeight - 120},
              'bg-white',
            )}>
            <TitleContainer
              containerStyle={applyStyles('p-16')}
              title={i18nService.strings('more.header.title')}
              description={i18nService.strings('more.header.description')}
            />
            {!business.name && (
              <Touchable onPress={onEditBusinessSettings}>
                <View
                  style={applyStyles('my-lg mx-lg py-sm', {
                    fontSize: 14,
                    borderRadius: 8,
                    backgroundColor: colors['red-50'],
                  })}>
                  <Text
                    style={applyStyles('text-500 text-center', {
                      color: colors['red-200'],
                    })}>
                    {i18nService.strings('more.business_settings_edit_button')}
                  </Text>
                </View>
              </Touchable>
            )}
            {!!business.name && (
              <>
                <View
                  style={applyStyles(
                    'flex-row items-center ml-16 py-18 mb-32',
                  )}>
                  <Image
                    source={{
                      uri: business.profile_image?.url,
                    }}
                    style={applyStyles('w-full rounded-12', {
                      width: 24,
                      height: 24,
                    })}
                  />
                  <View style={applyStyles('pl-12')}>
                    <Text
                      style={applyStyles(
                        'text-uppercase text-sm text-700 text-black',
                      )}>
                      {business.name}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View style={applyStyles('mb-24')}>
              {moreOptions.map(({title, text, onPress}, index) => {
                return (
                  <Touchable onPress={onPress} key={`${title}-${index}`}>
                    <View
                      style={applyStyles(
                        'flex-row items-center py-10 px-10 border-t-1 border-gray-20',
                        index === moreOptions.length - 1 && 'border-b-1',
                      )}>
                      <View style={applyStyles('flex-1 pl-sm')}>
                        <Text
                          style={applyStyles('text-400 text-sm text-gray-300')}>
                          {title}
                        </Text>
                        <Text
                          style={applyStyles('text-400 text-xs text-gray-200')}>
                          {text}
                        </Text>
                      </View>
                      <Icon
                        size={20}
                        type="feathericons"
                        name="chevron-right"
                        color={colors['gray-50']}
                      />
                    </View>
                  </Touchable>
                );
              })}
            </View>
            <View style={applyStyles('px-16')}>
              <Touchable onPress={handleInviteFriends}>
                <Image
                  resizeMode="center"
                  source={require('@/assets/images/invite-banner.png')}
                  style={applyStyles('mb-24', {width: '100%', height: 80})}
                />
              </Touchable>
              <View style={applyStyles('center pb-24')}>
                <SecureEmblem />
              </View>
            </View>
            <View style={applyStyles('flex-1')}>
              <Touchable onPress={handleLogoutConfirm}>
                <View
                  style={applyStyles(
                    'flex-row border-1 border-gray-20 center p-16 mx-16 rounded-md',
                  )}>
                  <Icon
                    size={20}
                    name="log-out"
                    type="feathericons"
                    color={colors['gray-50']}
                    style={applyStyles('mr-24')}
                  />
                  <Text style={applyStyles('text-gray-100 text-sm font-bold')}>
                    {i18nService.strings('more.logout_button')}
                  </Text>
                </View>
              </Touchable>
            </View>
            <View style={applyStyles('py-32 center')}>
              <Text
                style={applyStyles('text-gray-50 text-xxs font-bold mb-16')}>
                Version {version}
              </Text>
              <Image
                style={applyStyles('w-72 h-16')}
                source={require('@/assets/images/shara_logo_grey.png')}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  },
);
