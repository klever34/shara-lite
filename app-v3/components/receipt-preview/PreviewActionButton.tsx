import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';
import {Icon} from '../Icon';
import Touchable from '../Touchable';

type Props = {
  label: string;
  icon: string;
  onPress(): void;
};

export const PreviewActionButton = (props: Props) => {
  const {icon, label, onPress} = props;
  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('p-md center')}>
        <View
          style={applyStyles('mb-sm center', {
            width: 40,
            height: 40,
            borderRadius: 4,
            backgroundColor: colors['red-10'],
          })}>
          <Icon
            size={24}
            name={icon}
            type="feathericons"
            color={colors.primary}
          />
        </View>
        <Text
          style={applyStyles('text-400 text-center', {
            color: colors['gray-300'],
          })}>
          {label}
        </Text>
      </View>
    </Touchable>
  );
};
