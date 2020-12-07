import {getCustomerWhatsappNumber} from 'app-v1/helpers/utils';
import {useCallback} from 'react';
import {Alert} from 'react-native';
import Share from 'react-native-share';
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
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
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
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', errorMessages[e.error]);
      }
    }
  }, [image, message, recipient, title, userCountryCode]);

  return {handleSmsShare, handleEmailShare, handleWhatsappShare};
};
