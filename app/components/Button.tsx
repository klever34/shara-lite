import React, {useCallback, ReactNode} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '@/styles';
import Touchable from './Touchable';
import {applyStyles} from '@/styles';

interface variantColorStylesOptions {
  [key: string]: any;
}

interface variantColorHexColorOptions {
  [key: string]: string;
}

export type ButtonProps = BaseButtonProps & {
  style?: ViewStyle;
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: 'filled' | 'clear';
  variantColor?: 'red' | 'white' | 'clear';
};

export const Button = ({
  title,
  style,
  onPress,
  isLoading,
  disabled,
  children,
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
    clear: {
      button: styles.clearButton,
      text: styles.whiteButtonText,
    },
  };

  const activityIndicatorColor: variantColorHexColorOptions = {
    white: colors.primary,
    red: colors.white,
  };

  const renderContent = useCallback(() => {
    if (title) {
      return (
        <Text
          style={{...styles.text, ...variantColorStyles[variantColor].text}}>
          {title}
        </Text>
      );
    }
    if (children) {
      return children;
    }
  }, [title, children, variantColor, variantColorStyles]);

  return (
    <BaseButton
      onPress={onPress}
      disabled={disabled || isLoading}
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
        renderContent()
      )}
    </BaseButton>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 8,
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
  clearButton: {
    elevation: 0,
    backgroundColor: colors.white,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    textTransform: 'uppercase',
  },
  whiteButtonText: {
    color: colors.primary,
  },
  redButtonText: {
    color: colors.white,
  },
});

type BaseButtonProps = {
  title?: string;
  style?: ViewStyle;
  onPress?: () => void;
  children?: ReactNode;
  disabled?: boolean;
};

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
    fontFamily: 'Rubik-Light',
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
