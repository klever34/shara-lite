import {applyStyles, colors} from '@/styles';
import {upperCase} from 'lodash';
import React, {useCallback} from 'react';
import {
  ImageProps,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon, {IconProps} from './Icon';

export type PlaceholderImageProps = {
  text: string;
  style?: ViewStyle;
  isLoading?: boolean;
  textStyle?: TextStyle;
  indicator?: {
    style: StyleProp<ViewStyle>;
    icon: IconProps;
  };
  image?: ImageProps['source'];
};

const PlaceholderImage = ({
  text,
  image,
  indicator,
  textStyle,
  isLoading,
  style = {},
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
  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          animating={isLoading}
          color={colors['red-200']}
        />
      );
    }
    if (image) {
      return (
        <Image
          source={image}
          resizeMode="cover"
          style={applyStyles('rounded-40', {width: '100%', height: '100%'})}
        />
      );
    }
    return (
      <Text style={applyStyles('text-xl text-white text-400', textStyle)}>
        {displayLetter}
      </Text>
    );
  }, [image, isLoading, displayLetter, textStyle]);

  return (
    <View
      style={applyStyles(
        applyStyles('center w-40 h-40 rounded-20', {
          backgroundColor: '#4D86E3',
        }),
        style,
      )}>
      {renderContent()}
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
