import React from 'react';
import {as, colors} from '@/styles';
import {Text} from '@/components';
import Touchable from '@/components/Touchable';
import {TextStyle, View} from 'react-native';
import {Icon} from '@/components/Icon';

export type MoneyActionsContainerProps = {
  figure: {label: string; value: string};
  tag?: {
    label: string;
    style?: TextStyle;
    onPress?: () => void;
    pressInfo?: string;
  };
  actions: {
    label: string;
    onPress: () => void;
    icon: {name: string; color: string; bgColor: string};
    disabled?: boolean;
  }[];
};

export const MoneyActionsContainer = ({
  figure,
  tag,
  actions,
}: MoneyActionsContainerProps) => {
  return (
    <View style={as('items-center py-24 px-16')}>
      <Text style={as('mb-8 text-gray-100')}>{figure.label}</Text>
      <Text style={as('mb-16 text-3xl font-bold')}>{figure.value}</Text>
      {tag && (
        <Touchable onPress={tag.onPress}>
          <View style={as('flex-row items-center')}>
            <Text
              style={as(
                'uppercase text-gray-200 font-bold bg-gray-20 py-8 px-12 rounded-16 mr-12',
                tag.style,
              )}>
              {tag.label}
            </Text>
            {tag.pressInfo && <Text>{tag.pressInfo}</Text>}
          </View>
        </Touchable>
      )}
      <View style={as('flex-row my-16')}>
        {actions.map(({onPress, label, icon, disabled = false}) => {
          return (
            <Touchable onPress={disabled ? undefined : onPress}>
              <View style={as('items-center px-20 py-12')}>
                <View
                  style={as('rounded-32 p-8 mb-8', {
                    backgroundColor: disabled
                      ? colors['gray-20']
                      : icon.bgColor,
                  })}>
                  <Icon
                    type="feathericons"
                    name={icon.name}
                    size={32}
                    color={disabled ? colors['gray-50'] : icon.color}
                  />
                </View>
                <Text style={as(disabled ? 'text-gray-50' : '')}>{label}</Text>
              </View>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
};
