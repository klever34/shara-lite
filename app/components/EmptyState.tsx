import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ImageProps,
  ImageStyle,
} from 'react-native';
import {applyStyles, colors} from '../styles';

export type EmptyStateProps = {
  text?: string;
  heading?: string;
  children?: React.ReactNode;
  imageStyle?: ImageStyle;
  style?: string | {[key: string]: any};
  source?: ImageProps['source'];
};

const EmptyState = (props: EmptyStateProps) => {
  const {style, children, heading, source, text, imageStyle} = props;
  return (
    <View
      style={applyStyles(
        'flex-1 my-xl',
        'justify-center',
        'items-center',
        style,
      )}>
      {source && (
        <Image
          source={source}
          style={applyStyles('mb-md', {width: 140, height: 140}, imageStyle)}
        />
      )}
      {!!heading && (
        <Text
          style={applyStyles(
            'pb-xs text-700 text-gray-300 text-2xl text-center',
          )}>
          {heading}
        </Text>
      )}
      {!!text && (
        <Text
          style={applyStyles('text-400 text-sm text-gray-200 text-center', {
            maxWidth: 300,
            marginHorizontal: 'auto',
          })}>
          {text}
        </Text>
      )}
      {children}
    </View>
  );
};

export default EmptyState;
