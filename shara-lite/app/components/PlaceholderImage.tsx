import {applyStyles} from '@/styles';
import {upperCase} from 'lodash';
import React from 'react';
import {StyleProp, Text, TextStyle, View, ViewStyle} from 'react-native';
import Icon, {IconProps} from './Icon';

export type PlaceholderImageProps = {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  indicator?: {
    style: StyleProp<ViewStyle>;
    icon: IconProps;
  };
};

const PlaceholderImage = ({
  text,
  style = {},
  indicator,
  textStyle,
}: PlaceholderImageProps) => {
  let displayLetter: string;
  if (text && text[0].match(/[A-Za-z]/)) {
    const splitText = text.split(' ');
    if (splitText.length > 1) {
      displayLetter = upperCase(`${splitText[0][0]}${splitText[1][0] ?? ''}`);
    } else {
      displayLetter = upperCase(text[0]);
    }
  } else {
    displayLetter = '#';
  }
  return (
    <View
      style={applyStyles(
        applyStyles('center w-40 h-40 rounded-20', {
          backgroundColor: '#4D86E3',
        }),
        style,
      )}>
      <Text style={applyStyles('text-xl text-white text-400', textStyle)}>
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
