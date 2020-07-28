import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import capitalize from 'lodash/capitalize';

type PlaceholderImageProps = {
  text: string;
  style?: ViewStyle;
};

const PlaceholderImage = ({text, style = {}}: PlaceholderImageProps) => {
  let displayLetter: string;
  if (text && text[0].match(/[A-Za-z]/)) {
    displayLetter = capitalize(text[0]);
  } else {
    displayLetter = '#';
  }
  return (
    <View style={applyStyles(styles.container, style)}>
      <Text style={styles.text}>{displayLetter}</Text>
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
