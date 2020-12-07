import {getCustomerWhatsappNumber} from '@/helpers/utils';
import {useCallback} from 'react';
import {Alert} from 'react-native';
import Share from 'react-native-share';
//@ts-ignore
import {AppInstalledChecker} from 'react-native-check-app-install';
import {getAuthService} from '..';

export type ShareHookProps = {
  title: string;
  image: string;
  subject: string;
  message: string;
  recipient?: string;
};

export const useShare = ({
  recipient,
  message,
  title,
  image,
  subject,
}: ShareHookProps) => {
  const user = getAuthService().getUser();
  const userCountryCode = user?.country_code;

  const handleSmsShare = useCallback(async () => {
    const shareOptions = {
      // @ts-ignore
      social: Share.Social.SMS,
      title,
      message,
      recipient,
    };

    if (!recipient) {
      Alert.alert('Info', 'Please add a customer to share receipt via SMS');
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    }
  }, [message, recipient, title]);

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
      Alert.alert(
        'Info',
        'Please add a customer to share receipt via Whatsapp',
      );
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
