import React from 'react';
import {Image, StyleSheet, Text, View, ImageProps} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';

type Props = {
  text?: string;
  heading?: string;
  source: ImageProps['source'];
};

const EmptyState = (props: Props) => {
  const {heading, source, text} = props;
  return (
    <View
      style={applyStyles(
        'flex-1',
        'justify-center',
        'items-center',
        styles.container,
      )}>
      <Image style={applyStyles('pb-xl', styles.image)} source={source} />
      {!!heading && (
        <Text style={applyStyles('pb-xs', 'heading-700', styles.heading)}>
          {heading}
        </Text>
      )}
      {!!text && (
        <Text style={applyStyles(styles.text, 'text-400')}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heading: {
    fontSize: 24,
    color: colors['gray-300'],
  },
  text: {
    fontSize: 16,
    maxWidth: 300,
    lineHeight: 27,
    textAlign: 'center',
    color: colors['gray-200'],
    marginHorizontal: 'auto',
  },
  image: {
    width: 223,
    height: 223,
    marginBottom: 24,
  },
});

export default EmptyState;
