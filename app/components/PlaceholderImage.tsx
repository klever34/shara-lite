import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';

type PlaceholderImageProps = {
  text: string;
};

const PlaceholderImage = ({text}: PlaceholderImageProps) => {
  if (!text) {
    return null;
  }
  let displayLetter: string;
  if (Number(text[0])) {
    displayLetter = '#';
  } else {
    displayLetter = text[0];
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayLetter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: applyStyles('center mr-md my-md', {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
  }),
  text: applyStyles('text-xl font-bold', {color: colors.white}),
});

export default PlaceholderImage;
