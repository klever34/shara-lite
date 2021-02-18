import {Text} from '@/components';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {TextStyle, View, ViewStyle} from 'react-native';
import {TextProps} from 'react-native-ui-lib';
import {CircleWithIcon} from './CircleWithIcon';
import {Icon} from './Icon';
import Touchable from './Touchable';

type Section = {
  title?: string;
  caption?: string;
  titleStyle?: TextStyle;
  captionStyle?: TextStyle;
  titleNumberOfLines?: TextProps['numberOfLines'];
  captionNumberOfLines?: TextProps['numberOfLines'];
  style?: ViewStyle;
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
      <View style={applyStyles('flex-row p-12 items-center', style)}>
        {icon && <CircleWithIcon icon={icon} style={applyStyles('mr-12')} />}
        <View style={applyStyles('flex-row flex-1 pr-8')}>
          <View style={applyStyles('flex-1', leftSection?.style)}>
            {!!leftSection?.title && (
              <Text
                numberOfLines={leftSection.titleNumberOfLines}
                style={applyStyles(
                  'text-400 text-lg text-gray-300',
                  leftSection.titleStyle,
                )}>
                {leftSection.title}
              </Text>
            )}
            {!!leftSection?.caption && (
              <Text
                numberOfLines={leftSection.captionNumberOfLines}
                style={applyStyles(
                  'text-400 text-sm text-gray-200',
                  leftSection.captionStyle,
                )}>
                {leftSection.caption}
              </Text>
            )}
          </View>
          <View style={applyStyles()}>
            {!!rightSection?.title && (
              <View style={applyStyles('flex-1 justify-end')}>
                <Text
                  numberOfLines={rightSection.titleNumberOfLines}
                  style={applyStyles(
                    'text-400 text-xs text-gray-100',
                    rightSection.titleStyle,
                  )}>
                  {rightSection.title}
                </Text>
              </View>
            )}
            {!!rightSection?.caption && (
              <View style={applyStyles('flex-1 justify-end')}>
                <Text
                  numberOfLines={rightSection.captionNumberOfLines}
                  style={applyStyles(
                    'text-400 text-xs text-gray-100',
                    rightSection.captionStyle,
                  )}>
                  {rightSection.caption}
                </Text>
              </View>
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
