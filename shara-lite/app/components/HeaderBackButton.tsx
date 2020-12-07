import React from 'react';
import {useAppNavigation} from '@/services/navigation';
import {HeaderBackButton as BaseHeaderBackButton} from '@react-navigation/stack';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack/src/types';
import {applyStyles, colors} from '@/styles';
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
      backImage={
        iconName
          ? () => (
              <View
                style={applyStyles('center rounded-24', {
                  width: 30,
                  height: 30,
                })}>
                <Icon
                  type="feathericons"
                  color={colors['gray-300']}
                  size={24}
                  name={iconName}
                />
              </View>
            )
          : undefined
      }
      {...restProps}
      onPress={onPress ?? navigation.goBack}
    />
  );
};
