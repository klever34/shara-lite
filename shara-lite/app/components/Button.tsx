import React, {useCallback, ReactNode, useEffect, useState} from 'react';
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

export type ButtonProps = Omit<BaseButtonProps, 'onPress'> & {
  style?: ViewStyle;
  isLoading?: boolean;
  children?: React.ReactNode;
  onPress?: () => Promise<void> | void;
  variantColor?: 'red' | 'blue' | 'white' | 'green' | 'clear' | 'transparent';
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
      text: disabled ? styles.buttonTextDisabled : styles.whiteButtonText,
    },
    red: {
      button: styles.redButton,
      text: disabled ? styles.buttonTextDisabled : styles.redButtonText,
    },
    blue: {
      button: styles.blueButton,
      text: disabled ? styles.buttonTextDisabled : styles.redButtonText,
    },
    green: {
      button: styles.greenButton,
      text: disabled ? styles.buttonTextDisabled : styles.redButtonText,
    },
    clear: {
      button: styles.clearButton,
      text: disabled ? styles.buttonTextDisabled : styles.whiteButtonText,
    },
    transparent: {
      button: styles.transparentButton,
      text: disabled
        ? styles.buttonTextDisabled
        : applyStyles({color: colors['gray-300']}),
    },
  };

  const activityIndicatorColor: variantColorHexColorOptions = {
    white: colors.primary,
    red: colors.white,
  };

  const [loading, setLoading] = useState(isLoading);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const handlePress = useCallback(() => {
    if (onPress) {
      const result = onPress();
      if (result) {
        setLoading(true);
        result.finally(() => {
          setLoading(false);
        });
      }
    }
  }, [onPress]);

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
      onPress={handlePress}
      disabled={disabled || loading}
      style={applyStyles(
        styles.button,
        variantColorStyles[variantColor].button,
        {...style},
      )}>
      {loading ? (
        <ActivityIndicator
          animating={loading}
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
  blueButton: {
    backgroundColor: colors.blue,
  },
  greenButton: {
    backgroundColor: colors['green-200'],
  },
  clearButton: {
    elevation: 0,
    backgroundColor: colors.white,
  },
  transparentButton: {
    elevation: 0,
    borderWidth: 1.5,
    borderColor: colors['gray-20'],
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  whiteButtonText: {
    color: colors.primary,
  },
  redButtonText: {
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors['gray-100'],
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
  const textStyle = disabled
    ? baseButtonStyles.disabledText
    : baseButtonStyles.text;

  return (
    <Touchable onPress={onPress} disabled={disabled}>
      <View style={{...baseButtonStyles.container, ...style, ...disabledStyle}}>
        {children || <Text style={textStyle}>{title}</Text>}
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
    borderRadius: 36,
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
    textTransform: 'capitalize',
  },
  disabledText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors['gray-100'],
    textTransform: 'capitalize',
  },
  icon: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
  },
  disabled: {
    borderColor: colors['gray-20'],
    backgroundColor: colors['gray-20'],
  },
});
