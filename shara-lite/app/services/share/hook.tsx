import {getCustomerWhatsappNumber} from '@/helpers/utils';
import React, {useCallback, useContext} from 'react';
import {Alert, Text, ToastAndroid} from 'react-native';
import Share from 'react-native-share';
//@ts-ignore
import {AppInstalledChecker} from 'react-native-check-app-install';
import {getApiService, getAuthService, getI18nService} from '..';
import {useOfflineModal} from '@/components/OfflineModalProvider';
import {View} from 'react-native-ui-lib';
import {applyStyles, colors} from '@/styles';
import {Button} from '@/components';
import {handleError} from '../error-boundary';
import {ToastContext} from '@/components/Toast';

export type ShareHookProps = {
  title: string;
  image: string;
  subject: string;
  message: string;
  recipient?: string;
};

const strings = getI18nService().strings;

export const useShare = ({
  recipient,
  message,
  title,
  image,
  subject,
}: ShareHookProps) => {
  const user = getAuthService().getUser();
  const userCountryCode = user?.country_code;

  const {showSuccessToast} = useContext(ToastContext);
  const {isConnected, openModal, closeModal} = useOfflineModal();

  const handleOfflineSmsShare = useCallback(async () => {
    const shareOptions = {
      // @ts-ignore
      social: Share.Social.SMS,
      title,
      message,
      recipient,
    };

    if (!recipient) {
      const options = {
        title,
        message,
      };
      try {
        await Share.open(options);
      } catch (e) {
        console.log('Error', e.error);
      }
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        console.log('Error', e.error);
      }
    }
  }, [message, recipient, title]);

  const handleOnlineSmsShare = useCallback(
    async (callback?: () => void) => {
      try {
        if (recipient) {
          await getApiService().sendSMS({
            message,
            to: recipient ?? '',
          });
          callback?.();
          showSuccessToast(strings('message_sent'));
        } else {
          ToastAndroid.show(strings('sms_no_recipient'), ToastAndroid.LONG);
          handleOfflineSmsShare();
        }
      } catch (error) {
        handleError(error);
      }
    },
    [showSuccessToast, handleOfflineSmsShare],
  );

  const handleSmsShare = useCallback(
    (callback?: () => void) => {
      if (isConnected) {
        handleOnlineSmsShare(callback);
      } else {
        openModal('bottom-half', {
          renderContent: () => (
            <View>
              <Text
                style={applyStyles(
                  'py-16 text-center text-700 text-gray-300 text-uppercase',
                )}>
                {strings('offline_sms_notification_title')}
              </Text>
              <Text
                style={applyStyles(
                  'text-center pb-24 px-48 text-gray-300 text-base',
                )}>
                {strings('offline_sms_notification_description')}
              </Text>
              <View
                style={applyStyles('p-24 flex-row justify-end border-t-1', {
                  borderColor: colors['gray-20'],
                })}>
                <View style={applyStyles('flex-row items-center')}>
                  <Button
                    onPress={closeModal}
                    variantColor="clear"
                    title={strings('cancel')}
                    textStyle={applyStyles('text-secondary text-uppercase')}
                    style={applyStyles('mr-16', {width: 120, borderWidth: 0})}
                  />
                  <Button
                    variantColor="blue"
                    title={strings('confirm')}
                    onPress={handleOfflineSmsShare}
                    style={applyStyles({width: 120})}
                    textStyle={applyStyles('text-uppercase')}
                  />
                </View>
              </View>
            </View>
          ),
        });
      }
    },
    [isConnected, closeModal, handleOnlineSmsShare, handleOfflineSmsShare],
  );

  const handleEmailShare = useCallback(async () => {
    const shareOptions = {
      title,
      subject,
      message,
      url: `data:image/png;base64,${image}`,
    };

    try {
      await Share.open(shareOptions);
    } catch (e) {
      console.log('Error', e.error);
    }
  }, [image, message, subject, title]);

  const handleWhatsappShare = useCallback(async () => {
    let isWhatsappInstalled, isWhatsappBusinessInstalled;
    const mobile = recipient;
    const whatsAppNumber = getCustomerWhatsappNumber(mobile, userCountryCode);
    const shareOptions = {
      title,
      message,
      whatsAppNumber,
      social: Share.Social.WHATSAPP,
      url: `data:image/png;base64,${image}`,
    };
    const errorMessages = {
      filename: 'Invalid file attached',
      whatsAppNumber: 'Please check the phone number supplied',
    } as {[key: string]: any};

    if (!recipient) {
      const options = {
        title,
        message,
        url: `data:image/png;base64,${image}`,
      };
      try {
        await Share.open(options);
      } catch (e) {
        console.log('Error', e.error);
      }
    } else {
      try {
        isWhatsappInstalled = await AppInstalledChecker.checkPackageName(
          'com.whatsapp',
        );
        isWhatsappBusinessInstalled = await AppInstalledChecker.checkPackageName(
          'com.whatsapp.w4b',
        );
      } catch (e) {
        console.log(e);
      }
      if (isWhatsappInstalled) {
        try {
          await Share.shareSingle(shareOptions);
        } catch (e) {
          Alert.alert('Error', errorMessages[e.error]);
        }
      }
      if (isWhatsappBusinessInstalled) {
        try {
          await Share.open(shareOptions);
        } catch (e) {
          console.log(e);
        }
      }
      if (!isWhatsappInstalled && !isWhatsappBusinessInstalled) {
        Alert.alert(
          'Info',
          'Please install Whatsapp or Whatsapp for Business to share receipt via Whatsapp',
        );
      }
    }
  }, [image, message, recipient, title, userCountryCode]);

  return {handleSmsShare, handleEmailShare, handleWhatsappShare};
};
