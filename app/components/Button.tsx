import React, {ReactNode} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../styles';
import Touchable from './Touchable';
import {applyStyles} from '../helpers/utils';

interface variantColorStylesOptions {
  [key: string]: any;
}

interface variantColorHexColorOptions {
  [key: string]: string;
}

interface ButtonProps extends BaseButtonProps {
  style?: ViewStyle;
  isLoading?: boolean;
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
  style,
  onPress,
  isLoading,
  disabled,
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
      disabled={disabled}
      style={applyStyles(
        styles.button,
        variantColorStyles[variantColor].button,
        {...style},
      )}>
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
  disabled?: boolean;
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
  disabled: {
    opacity: 0.5,
  },
});

export const BaseButton = ({
  title = '',
  onPress,
  style = {},
  children,
  disabled,
}: BaseButtonProps) => {
  const disabledStyle = disabled ? baseButtonStyles.disabled : {};
  return (
    <Touchable onPress={onPress} disabled={disabled}>
      <View style={{...baseButtonStyles.container, ...style, ...disabledStyle}}>
        {children || <Text style={baseButtonStyles.text}>{title}</Text>}
      </View>
    </Touchable>
  );
};
