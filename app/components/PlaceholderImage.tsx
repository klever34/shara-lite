import React from 'react';
import {StyleProp, Text, View, ViewStyle} from 'react-native';
import capitalize from 'lodash/capitalize';
import Icon, {IconProps} from './Icon';
import {applyStyles} from '@/styles';

export type PlaceholderImageProps = {
  text: string;
  style?: ViewStyle;
  indicator?: {
    style: StyleProp<ViewStyle>;
    icon: IconProps;
  };
};

const PlaceholderImage = ({
  text,
  style = {},
  indicator,
}: PlaceholderImageProps) => {
  let displayLetter: string;
  if (text && text[0].match(/[A-Za-z]/)) {
    displayLetter = capitalize(text[0]);
  } else {
    displayLetter = '#';
  }
  return (
    <View
      style={applyStyles(
        applyStyles('center w-48 h-48 rounded-12 bg-red-30'),
        style,
      )}>
      <Text style={applyStyles('text-xl font-bold text-primary text-700')}>
        {displayLetter}
      </Text>
      {indicator && (
        <View
          style={applyStyles(
            'center absolute border-2 border-white rounded-12 w-24 h-24 -bottom-4 -right-4',
            indicator.style,
          )}>
          <Icon {...indicator.icon} style={applyStyles('text-white')} />
        </View>
      )}
    </View>
  );
};

export default PlaceholderImage;
