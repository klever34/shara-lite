import { Icon } from '@/components/Icon';
import Touchable from '@/components/Touchable';
import { applyStyles, colors } from '@/styles';
import React from 'react';
import { Text, View } from 'react-native';

type BNPLProductProps = {
    isSelected?: boolean;
    onPress?(product: any): void;
    leftSection: BNPLProductSection;
    rightSection: BNPLProductSection;
}

type BNPLProductSection = {
    top: string;
    bottom: string;
}

export const BNPLProduct = (props: BNPLProductProps) => {
    const { isSelected, onPress, leftSection, rightSection } = props;
    const containerStyle = isSelected ? 'border-green-200' : 'border-gray-20'
    const textStyle = isSelected ? 'text-green-200' : 'text-gray-200'

    return (
        <Touchable onPress={onPress}>
            <View style={applyStyles(`flex-row border-1 p-16 rounded-12 mb-16 items-center justify-between ${containerStyle}`)}>
                <View>
                    <Text style={applyStyles(`pb-4 font-bold ${textStyle}`)}>
                        {leftSection.top}
                    </Text>
                    <Text style={applyStyles('text-gray-50')}>{leftSection.bottom}</Text>
                </View>
                <View style={applyStyles('flex-row items-center')}>
                    <View>
                        <Text style={applyStyles(`pb-4 font-bold ${textStyle}`)}>{rightSection.top}</Text>
                        <Text style={applyStyles('text-gray-50 text-right')}>{rightSection.bottom}</Text>
                    </View>
                    {isSelected && <View style={applyStyles('pl-8')}>
                        <Icon name="check-circle" type="material-icons" size={16} color={colors['green-200']} />
                    </View>}
                </View>
            </View>
      </Touchable>
    )
}