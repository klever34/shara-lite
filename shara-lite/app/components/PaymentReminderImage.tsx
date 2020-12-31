import {amountWithCurrency} from '@/helpers/utils';
import {getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles} from '@/styles';
import {format, isToday} from 'date-fns';
import React, {useCallback, useEffect, useRef} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import ViewShot, {ViewShotProperties} from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {SecureEmblem} from './SecureEmblem';

function PaymentReminderImage({
  date,
  amount,
  getImageUri,
}: {
  date?: Date;
  amount?: number;
  getImageUri: (base64: string) => void;
  captureMode?: ViewShotProperties['captureMode'];
}) {
  const viewShot = useRef<any>(null);
  const {callingCode} = useIPGeolocation();
  const business = getAuthService().getBusinessInfo();

  const getMobieNumber = useCallback(() => {
    const code = business.country_code || callingCode;
    if (business.mobile?.startsWith(code)) {
      return `+${code}${business.mobile.replace(code, '')}`;
    }
    return `+${code}${business.mobile}`;
  }, [business.country_code, business.mobile, callingCode]);

  const onCapture = useCallback(
    async (uri: any) => {
      if (uri) {
        const data = await RNFetchBlob.fs.readFile(uri, 'base64');
        getImageUri(data);
      }
    },
    [getImageUri],
  );

  useEffect(() => {
    viewShot.current.capture().then(onCapture);
  }, [date, amount, onCapture]);

  return (
    <ScrollView>
      <ViewShot ref={viewShot} options={{format: 'png'}}>
        <View style={applyStyles('bg-white')}>
          <View style={applyStyles('absolute top-20 right-6')}>
            <SecureEmblem style={applyStyles({width: 48, height: 48})} />
          </View>
          <View style={applyStyles('bg-red-200', {height: 10})} />
          <View style={applyStyles('center')}>
            <Text
              style={applyStyles(
                'pb-8 pt-32 text-center text-400 text-gray-300 text-uppercase',
              )}>
              Payment reminder for
            </Text>
            <Text
              style={applyStyles(
                'pb-8 text-center text-700 text-2xl text-red-200 text-uppercase',
              )}>
              {amountWithCurrency(amount)}
            </Text>
            {date && isToday(date) ? (
              <View
                style={applyStyles('p-8 mb-40 bg-red-200 center', {
                  borderRadius: 8,
                })}>
                <Text style={applyStyles('text-center text-white text-400')}>
                  Payment Due{' '}
                  <Text style={applyStyles('text-white text-700')}>Today</Text>
                </Text>
              </View>
            ) : (
              <Text
                style={applyStyles(
                  'pb-40 text-center text-400 text-xs text-gray-100 text-uppercase',
                )}>
                This payment is due on {date && format(date, 'dd MMM yyyy')}
              </Text>
            )}
            <View style={applyStyles('center pb-32')}>
              {!!business.profile_image && (
                <View style={applyStyles('w-40 h-40 mb-12')}>
                  <Image
                    style={applyStyles('w-full h-full rounded-sm')}
                    source={{
                      uri: business.profile_image.url,
                    }}
                  />
                </View>
              )}
              {!!business.name && (
                <Text
                  style={applyStyles(
                    'text-400 text-center uppercase text-sm leading-16 text-gray-300 pb-4',
                  )}>
                  {business.name}
                </Text>
              )}
              {!!business.mobile && (
                <Text
                  style={applyStyles(
                    'text-400 text-center text-xs leading-16 text-gray-200 ',
                  )}>
                  {getMobieNumber()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
}

export default PaymentReminderImage;
