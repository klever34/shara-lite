import { Icon } from '@/components/Icon';
import Touchable from '@/components/Touchable';
import { amountWithCurrency } from '@/helpers/utils';
import { getI18nService } from '@/services';
import { applyStyles, colors } from '@/styles';
import React from 'react';
import { Text, View } from 'react-native';

type BNPLProductProps = {
    total_amount?: number;
    isSelected?: boolean;
    isMerchant?: boolean;
    merchant_amount?: number;
    payment_frequency: number;
    onPress?(product: any): void;
    payment_frequency_unit: string;
    payment_frequency_amount: number;
}

const strings = getI18nService().strings;

export const BNPLProduct = (props: BNPLProductProps) => {
    const { 
        onPress, 
        isMerchant, 
        isSelected, 
        total_amount, 
        merchant_amount,
        payment_frequency, 
        payment_frequency_unit, 
        payment_frequency_amount, 
    } = props;
    const containerStyle = isSelected ? 'border-green-300' : 'border-gray-100'
    const textStyle = isSelected ? 'text-green-300' : 'text-gray-100'
    const frequency_units: {[key: string]: string} = {
        'weeks': 'week'
    };

    return (
        <Touchable onPress={onPress}>
            <View style={applyStyles(`border-1 p-16 rounded-12 mb-16 ${containerStyle}`)}>
                <View style={applyStyles('pb-8 flex-row items-center justify-between')}>
                    <Text style={applyStyles(`pb-4 font-bold text-base ${textStyle}`)}>
                        {amountWithCurrency(payment_frequency_amount)}/{frequency_units[payment_frequency_unit]}
                    </Text>
                    {isSelected && <Icon name="check-circle" type="material-icons" size={16} color={colors['green-300']} />}
                </View>
                <View style={applyStyles('flex-row items-center justify-between')}>
                    <View style={applyStyles('flex-row items-center')}>
                        <View>
                            <Text style={applyStyles(`pb-4 text-sm ${isSelected ? 'text-gray-200' : 'text-gray-100'}`)}>{strings('total')}</Text>
                            <Text style={applyStyles(`font-bold ${textStyle}`)}>{amountWithCurrency(total_amount)}</Text>
                        </View>
                        {isMerchant && <View style={applyStyles('pl-24')}>
                            <Text style={applyStyles(`pb-4 text-sm ${isSelected ? 'text-gray-200' : 'text-gray-100'}`)}>{strings('you_get')}</Text>
                            <Text style={applyStyles(`font-bold ${isSelected ? 'text-gray-200' : 'text-gray-100'}`)}>{amountWithCurrency(merchant_amount)}</Text>
                        </View>}
                    </View>
                    <View style={applyStyles(`border-1 px-8 py-4 rounded-4 ${containerStyle} ${isSelected ? 'bg-green-300' : 'transparent'}`)}>
                        <Text style={applyStyles(`${isSelected ? 'text-white' : 'text-gray-100'} font-bold`)}>
                            {payment_frequency} {payment_frequency_unit}
                        </Text>
                    </View>
                </View>
            </View>
      </Touchable>
    )
}