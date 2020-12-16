import React from 'react';
import {
  Image,
  Text,
  View,
  ImageProps,
  ImageStyle,
  TextStyle,
} from 'react-native';
import {applyStyles} from '../styles';

export type EmptyStateProps = {
  text?: string;
  heading?: string;
  children?: React.ReactNode;
  imageStyle?: ImageStyle;
  headingStyle?: TextStyle;
  textStyle?: TextStyle;
  style?: string | {[key: string]: any};
  source?: ImageProps['source'];
};

const EmptyState = (props: EmptyStateProps) => {
  const {
    style,
    children,
    heading,
    source,
    text,
    imageStyle,
    headingStyle,
    textStyle,
  } = props;
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
            headingStyle,
          )}>
          {heading}
        </Text>
      )}
      {!!text && (
        <Text
          style={applyStyles(
            'text-400 text-base text-black text-center',
            {
              maxWidth: 300,
              marginHorizontal: 'auto',
            },
            textStyle,
          )}>
          {text}
        </Text>
      )}
      {children}
    </View>
  );
};

export default EmptyState;
