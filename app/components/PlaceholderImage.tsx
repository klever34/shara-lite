import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import capitalize from 'lodash/capitalize';
import Icon, {IconProps} from './Icon';

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
    <View style={applyStyles(styles.container, style)}>
      <Text style={styles.text}>{displayLetter}</Text>
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

const styles = StyleSheet.create({
  container: applyStyles('center', {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
  }),
  text: applyStyles('text-xl font-bold', {color: colors.white}),
});

export default PlaceholderImage;
