import React from 'react';
import {useAppNavigation} from '@/services/navigation';
import {HeaderBackButton as BaseHeaderBackButton} from '@react-navigation/stack';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack/src/types';
import {applySpacing, applyStyles, colors} from '@/styles';
import Icon from '@/components/Icon';
import {View} from 'react-native';

export type HeaderBackButtonProps = StackHeaderLeftButtonProps & {
  iconName?: string;
};

export const HeaderBackButton = ({
  onPress,
  iconName,
  ...restProps
}: HeaderBackButtonProps) => {
  const navigation = useAppNavigation();
  return (
    <BaseHeaderBackButton
      backImage={() => (
        <View
          style={applyStyles('center rounded-24', {
            width: applySpacing(32),
            height: applySpacing(32),
          })}>
          <Icon
            type="feathericons"
            color={colors['gray-300']}
            size={applySpacing(24)}
            name={iconName ?? 'arrow-left'}
          />
        </View>
      )}
      {...restProps}
      onPress={onPress ?? navigation.goBack}
    />
  );
};
