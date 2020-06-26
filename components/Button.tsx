import React, {ElementType, ReactNode} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../styles/base';

type ButtonProps = {
  title?: string;
  style?: ViewStyle;
  onPress: () => void;
  children?: ReactNode;
};

export const buttonStyles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    elevation: 3,
    borderRadius: 36,
  },
  text: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: 14,
    lineHeight: 20,
  },
  icon: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
  },
});

const Button = ({title = '', onPress, style = {}, children}: ButtonProps) => {
  const Touchable: ElementType =
    Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
  return (
    <Touchable onPress={onPress}>
      <View style={{...buttonStyles.container, ...style}}>
        {children || <Text style={buttonStyles.text}>{title}</Text>}
      </View>
    </Touchable>
  );
};

export default Button;
