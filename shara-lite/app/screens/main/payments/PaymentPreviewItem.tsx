import {IPaymentOption} from '@/models/PaymentOption';
import {getAnalyticsService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {applyStyles, colors} from '@/styles';
import Clipboard from '@react-native-community/clipboard';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

export const PaymentPreviewItem = ({item}: {item: IPaymentOption}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = (option: IPaymentOption) => {
    const value = `${option.name}${option?.fieldsData?.map(
      (field) => `\n${field.label}: ${field.value}`,
    )}`;
    Clipboard.setString(value);
    getAnalyticsService()
      .logEvent('copiedPaymentOption', {})
      .then(() => {})
      .catch(handleError);
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 3000);
  };

  return (
    <View
      style={applyStyles(
        'flex-row items-center py-8 bg-white justify-between',
        {
          borderTopColor: colors['gray-10'],
          borderTopWidth: 1,
          borderBottomColor: colors['gray-10'],
          borderBottomWidth: 1,
        },
      )}>
      <View style={applyStyles('py-8 flex-1')}>
        <Text style={applyStyles('pb-4 text-gray-200 text-uppercase text-xs')}>
          {item.name}
        </Text>
        {item?.fieldsData?.map((i) => (
          <Text
            key={i.key}
            style={applyStyles('text-gray-300 text-400 text-lg')}>
            {i.value}
          </Text>
        ))}
      </View>
      <View>
        <TouchableOpacity onPress={() => copyToClipboard(item)}>
          {hasCopied ? (
            <View
              style={applyStyles('px-10 py-8 bg-gray-20 rounded-4 p-8', {
                backgroundColor: colors['green-100'],
              })}>
              <Text
                style={applyStyles(
                  'text-uppercase text-400 text-gray-300 text-xs text-white',
                )}>
                {strings('payment.payment_preview_item.copied')}
              </Text>
            </View>
          ) : (
            <View style={applyStyles('px-10 py-8 bg-gray-20 rounded-4 p-8')}>
              <Text
                style={applyStyles(
                  'text-uppercase text-400 text-gray-300 text-xs',
                )}>
                {strings('payment.payment_preview_item.copy')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
