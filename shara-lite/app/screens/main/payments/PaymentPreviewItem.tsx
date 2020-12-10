import {IPaymentOption} from '@/models/PaymentOption';
import {applyStyles, colors} from '@/styles';
import Clipboard from '@react-native-community/clipboard';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

export const PaymentPreviewItem = ({item}: {item: IPaymentOption}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = (option: IPaymentOption) => {
    const value = `${option.name}\n${option?.fieldsData?.map(
      (field) => `${field.label}: ${field.value}`,
    )}`;
    Clipboard.setString(value);
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
          <View style={applyStyles('px-10 py-8 bg-gray-20 rounded-4 p-8')}>
            <Text
              style={applyStyles(
                'text-uppercase text-400 text-gray-300 text-xs',
              )}>
              {hasCopied ? 'Copied' : 'Copy'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
