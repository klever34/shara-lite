import {Image, SecureEmblem, Text} from '@/components';
import {Icon} from '@/components/Icon';
import {TitleContainer} from '@/components/TitleContainer';
import Touchable from '@/components/Touchable';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {AppContext} from '@/contexts/app';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {
  getAnalyticsService,
  getAuthService,
  getHelpDeskService,
  getI18nService,
  getRemoteConfigService,
  getStorageService,
} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useRealmLogout} from '@/services/realm';
import {useSyncChecks} from '@/services/realm/hooks/use-sync-checks';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, SafeAreaView, ScrollView, View} from 'react-native';
import {MoreStackParamList} from '.';
import {MainStackParamList} from '..';
import {version} from '../../../../package.json';
import {inviteImageBase64String} from './inviteImageBase64String';
import {RootStackParamList} from '@/index';
import {WebView} from 'react-native-webview';

const i18nService = getI18nService();
const strings = getI18nService().strings;

export const MoreOptionsScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const navigation = useAppNavigation<
      RootStackParamList & MainStackParamList & MoreStackParamList
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
    const user = getAuthService().getUser();
    const onPaymentSettings = useCallback(async () => {
      const idValue = await getStorageService().getItem('bvn');
      if (!user?.is_identity_verified) {
        const bvnVerificationEnabled = getRemoteConfigService()
          .getValue('enableBVNVerification')
          .asBoolean();
        if (idValue && !bvnVerificationEnabled) {
          navigation.navigate('DisburementScreen');
        } else {
          navigation.navigate('PaymentSettings');
        }
      } else {
        navigation.navigate('DisburementScreen');
      }
    }, [navigation, user]);

    const {reloadApp} = useContext(AppContext);

    const languages = i18nService.getLocales().options;
    const onLanguageSettings = useCallback(() => {
      const options = languages.map(({name, code}) => {
        return {
          text: name,
          onPress: () => {
            i18nService.setCurrentLocale(code);
            reloadApp();
          },
        };
      });
      openModal('options', {
        options,
      });
    }, [languages, openModal, reloadApp]);

    const moreOptions = useMemo(() => {
      return [
        {
          leftSection: {
            title: strings('more.list.profile_settings.title'),
            caption: strings('more.list.profile_settings.description'),
          },
          onPress: () => {
            navigation.navigate('UserProfileSettings');
          },
        },
        {
          leftSection: {
            title: strings('more.list.business_settings.title'),
            caption: strings('more.list.business_settings.description'),
          },
          onPress: onEditBusinessSettings,
        },
        {
          leftSection: {
            title: strings('more.list.payment_settings.title'),
            caption: strings('more.list.payment_settings.description'),
          },
          onPress: onPaymentSettings,
        },
        {
          leftSection: {
            title: 'Security',
            caption: 'Set your PIN and security questions',
          },
          onPress: () => {
            navigation.navigate('SecuritySettings');
          },
        },
        {
          leftSection: {
            title: strings('more.list.kyc_settings.title'),
            caption: strings('more.list.kyc_settings.description'),
          },
          onPress: () => {
            const closeModal = openModal('full', {
              renderContent: () => {
                return (
                  <>
                    <View
                      style={applyStyles(
                        'justify-center items-end w-full px-16 py-12',
                      )}>
                      <Touchable
                        onPress={() => {
                          closeModal();
                        }}>
                        <Icon type="feathericons" name="x" size={32} />
                      </Touchable>
                    </View>
                    <WebView
                      source={{
                        uri: `https://shara.retool.com/embedded/public/89034f9f-4280-455c-b541-05486ae0cecc?token=${getAuthService().getToken()}&user_id=${
                          user?.id ?? ''
                        }`,
                      }}
                      injectedJavaScript={`
                        const branding = document.getElementsByClassName("retool-branding")[0];
                        if (branding) {
                          branding.style.display = "none";
                        }
                      `}
                    />
                  </>
                );
              },
            });
          },
        },
        ...(languages.length > 1
          ? [
              {
                leftSection: {
                  title: strings('more.list.language.title'),
                  caption: strings('more.list.language.description'),
                },
                onPress: onLanguageSettings,
              },
            ]
          : []),
        {
          leftSection: {
            title: strings('more.list.referral.title'),
            caption: strings('more.list.referral.description'),
          },
          onPress: () => {
            navigation.navigate('Referral');
          },
        },
        {
          leftSection: {
            title: strings('more.list.feedback.title'),
            caption: strings('more.list.feedback.description'),
          },
          onPress: () => {
            navigation.navigate('Feedback');
          },
        },
        {
          leftSection: {
            title: strings('more.list.support.title'),
            caption: strings('more.list.support.description'),
          },
          onPress: () => {
            getHelpDeskService().startChat();
          },
        },
      ];
    }, [
      onEditBusinessSettings,
      onPaymentSettings,
      languages.length,
      onLanguageSettings,
      navigation,
      openModal,
      user,
    ]);

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
        text: strings('more.logout.logout_data_verification_text'),
      });
      const {isSynced} = await hasAllRecordsBeenSynced();
      closeLoadingModal();

      const message = isSynced
        ? strings('more.logout.logout_confirmation_text')
        : strings('more.logout.logout_unsaved_data_text');

      Alert.alert('Warning', message, [
        {
          text: strings('more.no'),
          onPress: () => {},
        },
        {
          text: strings('more.yes'),
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
        <ScrollView>
          <View
            style={applyStyles(
              {minHeight: dimensions.fullHeight - 120},
              'bg-white',
            )}>
            <TitleContainer
              containerStyle={applyStyles('px-16 mt-16')}
              title={strings('more.header.title')}
              description={strings('more.header.description')}
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
                      color: colors['green-100'],
                    })}>
                    {strings('more.business_settings_edit_button')}
                  </Text>
                </View>
              </Touchable>
            )}
            {!!business.name && (
              <>
                <View style={applyStyles('flex-row items-center ml-16 py-32')}>
                  {!!business.profile_image && (
                    <Image
                      source={{
                        uri: business.profile_image.url,
                      }}
                      style={applyStyles('w-full rounded-24', {
                        width: 24,
                        height: 24,
                      })}
                    />
                  )}
                  <View style={applyStyles('pl-12')}>
                    <Text
                      style={applyStyles(
                        'text-uppercase text-lg text-700 text-black',
                      )}>
                      {business.name}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View style={applyStyles('mb-24')}>
              {moreOptions.map((option, index) => {
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
                      index === moreOptions.length - 1 && {
                        borderBottomWidth: 1,
                      },
                    )}
                  />
                );
              })}
            </View>
            <View style={applyStyles('px-16')}>
              <Touchable onPress={handleInviteFriends}>
                <Image
                  resizeMode="center"
                  source={require('@/assets/images/invite-banner.png')}
                  style={applyStyles('mb-24', {
                    width: '100%',
                    height: 80,
                  })}
                />
              </Touchable>
              <View style={applyStyles('center pb-24')}>
                <SecureEmblem />
              </View>
            </View>
            <View style={applyStyles('flex-1 mx-32')}>
              <Touchable onPress={handleLogoutConfirm}>
                <View
                  style={applyStyles(
                    'flex-row border-1 border-gray-20 center p-16 rounded-md',
                  )}>
                  <Icon
                    size={20}
                    name="log-out"
                    type="feathericons"
                    color={colors['gray-50']}
                    style={applyStyles('mr-24')}
                  />
                  <Text style={applyStyles('text-gray-100 text-sm font-bold')}>
                    {strings('more.logout_button')}
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
