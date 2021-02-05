import {Header, SecureEmblem} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IPaymentOption} from '@/models/PaymentOption';
import {getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {EditPaymetPreviewLabelModal} from './EditPaymentPreviewLabelModal';
import {PaymentPreviewItem} from './PaymentPreviewItem';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

type Props = {
  onClose: () => void;
  paymentOptions: IPaymentOption[];
} & ModalWrapperFields;

export const PaymentPreviewModal = withModal(
  ({onClose, openModal, paymentOptions}: Props) => {
    const {callingCode} = useIPGeolocation();
    const [business, setBusiness] = useState(
      getAuthService().getBusinessInfo(),
    );

    const handleUpdateBusiness = useCallback((payload) => {
      setBusiness(payload);
    }, []);

    const getMobileNumber = useCallback(() => {
      const code = business.country_code || callingCode;
      if (business.mobile?.startsWith(code)) {
        return `+${code}${business.mobile.replace(code, '')}`;
      }
      return `+${code}${business.mobile}`;
    }, [business.country_code, business.mobile, callingCode]);

    const handleOpenEditPreviewLabel = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <EditPaymetPreviewLabelModal
            onClose={closeModal}
            business={business}
            onUpdateBusiness={handleUpdateBusiness}
          />
        ),
      });
    }, [business, openModal, handleUpdateBusiness]);

    return (
      <View style={{marginTop: 30, flex: 1}}>
        <Header
          title={strings('payment.payment_preview_modal.heading')}
          iconLeft={{iconName: 'x', onPress: onClose}}
        />
        <View style={applyStyles('flex-1 bg-gray-10 px-16 h-screen')}>
          <View style={applyStyles('flex-row justify-between items-center')}>
            <Image
              resizeMode="contain"
              style={applyStyles('w-80 h-80')}
              source={require('@/assets/images/shara_logo_red.png')}
            />
            <SecureEmblem style={applyStyles({width: 48, height: 48})} />
          </View>
          <ScrollView
            persistentScrollbar
            keyboardShouldPersistTaps="always"
            style={applyStyles('bg-white rounded-16 flex-1')}>
            <View style={applyStyles('bg-white rounded-16 p-16')}>
              {!!business.name && (
                <View style={applyStyles('flex-row items-center')}>
                  <View style={applyStyles('w-80 h-80')}>
                    {!!business.profile_image && (
                      <Image
                        style={applyStyles('w-full h-full rounded-lg')}
                        source={{
                          uri: business.profile_image.url,
                        }}
                      />
                    )}
                  </View>
                  <View style={applyStyles('flex-1 px-12')}>
                    <Text
                      style={applyStyles(
                        'text-700 uppercase leading-16 text-gray-300 mb-4',
                      )}>
                      {business.name}
                    </Text>
                    <Text
                      style={applyStyles(
                        'text-400 text-sm leading-16 text-gray-300 mb-4',
                      )}>
                      {business.address}
                    </Text>
                    {!!business.mobile && (
                      <Text
                        style={applyStyles(
                          'text-400 text-sm leading-16 text-gray-300 mb-4',
                          {
                            color: colors['gray-300'],
                          },
                        )}>
                        {strings('tel')}: {getMobileNumber()}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <View style={applyStyles('pt-16')}>
                <Touchable onPress={handleOpenEditPreviewLabel}>
                  <View style={applyStyles('flex-row pt-8 pb-24 center')}>
                    <Text
                      style={applyStyles('text-gray-300 text-700 text-center')}>
                      {business.payment_label || 'You can pay me via'}
                    </Text>
                    <Icon
                      name="edit"
                      size={16}
                      type="feathericons"
                      color={colors['gray-50']}
                      style={applyStyles('pl-8')}
                    />
                  </View>
                </Touchable>
                {paymentOptions.map((item, index) => (
                  <PaymentPreviewItem
                    item={item}
                    key={`${item.name}-${index}`}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={applyStyles('items-center py-32 bg-gray-10')}>
          <Text style={applyStyles('text-center text-gray-100 text-sm')}>
            {strings('payment.payment_preview_modal.footer.title')}
          </Text>
          <Text style={applyStyles('text-center text-gray-100 text-sm')}>
            {strings('payment.payment_preview_modal.footer.website_url')}
          </Text>
        </View>
      </View>
    );
  },
);
