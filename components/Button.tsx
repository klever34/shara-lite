import React, {ElementType, ReactNode} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../styles/base';

interface variantColorStylesOptions {
  [key: string]: any;
}

interface variantColorHexColorOptions {
  [key: string]: string;
}

interface ButtonProps {
  title: string;
  onPress(): void;
  isLoading: boolean;
  variantColor: 'red' | 'white';
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    borderRadius: 3,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  whiteButton: {
    backgroundColor: colors.white,
  },
  redButton: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 16,
    textTransform: 'uppercase',
  },
  whiteButtonText: {
    color: colors.primary,
  },
  redButtonText: {
    color: colors.white,
  },
});

export const Button = ({
  title,
  onPress,
  isLoading,
  variantColor = 'red',
}: ButtonProps) => {
  const variantColorStyles: variantColorStylesOptions = {
    white: {
      button: styles.whiteButton,
      text: styles.whiteButtonText,
    },
    red: {
      button: styles.redButton,
      text: styles.redButtonText,
    },
  };

  const activityIndicatorColor: variantColorHexColorOptions = {
    white: colors.primary,
    red: colors.white,
  };

  return (
    <BaseButton
      onPress={onPress}
      style={{...styles.button, ...variantColorStyles[variantColor].button}}>
      {isLoading ? (
        <ActivityIndicator
          animating={isLoading}
          color={activityIndicatorColor[variantColor]}
        />
      ) : (
        <Text
          style={{...styles.text, ...variantColorStyles[variantColor].text}}>
          {title}
        </Text>
      )}
    </BaseButton>
  );
};

type BaseButtonProps = {
  title?: string;
  style?: ViewStyle;
  onPress: () => void;
  children?: ReactNode;
};

export const baseButtonStyles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    elevation: 3,
    borderRadius: 36,
  },
  text: {
    color: colors.white,
    textTransform: 'uppercase',
    fontSize: 14,
    lineHeight: 20,
  },
  icon: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
  },
});

export const BaseButton = ({
  title = '',
  onPress,
  style = {},
  children,
}: BaseButtonProps) => {
  const Touchable: ElementType =
    Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;
  return (
    <Touchable onPress={onPress}>
      <View style={{...baseButtonStyles.container, ...style}}>
        {children || <Text style={baseButtonStyles.text}>{title}</Text>}
      </View>
    </Touchable>
  );
};
