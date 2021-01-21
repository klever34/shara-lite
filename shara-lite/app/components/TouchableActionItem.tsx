import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {TextProps} from 'react-native-ui-lib';
import {CircleWithIcon} from './CircleWithIcon';
import {Icon} from './Icon';
import Touchable from './Touchable';

type Section = {
  title?: string;
  caption?: string;
  titleNumberOfLines?: TextProps['numberOfLines'];
  captionNumberOfLines?: TextProps['numberOfLines'];
};

interface Props {
  icon?: string;
  style?: ViewStyle;
  onPress?(): void;
  leftSection?: Section;
  rightSection?: Section;
}

export const TouchableActionItem = (props: Props) => {
  const {icon, onPress, style, leftSection, rightSection} = props;
  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('flex-row p-12', style)}>
        {icon && <CircleWithIcon icon={icon} style={applyStyles('mr-12')} />}
        <View style={applyStyles('flex-1 pr-8')}>
          <View style={applyStyles('flex-row items-center justify-between')}>
            {!!leftSection?.title && (
              <Text
                numberOfLines={leftSection.titleNumberOfLines}
                style={applyStyles('text-400 text-base text-gray-300')}>
                {leftSection.title}
              </Text>
            )}
            {!!rightSection?.title && (
              <Text
                numberOfLines={rightSection.titleNumberOfLines}
                style={applyStyles('text-400 text-xs text-gray-100')}>
                {rightSection.title}
              </Text>
            )}
          </View>
          <View style={applyStyles('flex-row items-center justify-between')}>
            {!!leftSection?.caption && (
              <Text
                numberOfLines={leftSection.captionNumberOfLines}
                style={applyStyles('text-400 text-sm text-gray-200')}>
                {leftSection.caption}
              </Text>
            )}
            {!!rightSection?.caption && (
              <Text
                numberOfLines={rightSection.captionNumberOfLines}
                style={applyStyles('text-400 text-xs text-gray-100')}>
                {rightSection.caption}
              </Text>
            )}
          </View>
        </View>
        <Icon
          size={20}
          type="feathericons"
          name="chevron-right"
          color={colors['gray-50']}
        />
      </View>
    </Touchable>
  );
};
