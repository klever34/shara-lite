import React from 'react';
import {
  TouchableHighlight,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface variantColorStylesOptions {
  [key: string]: any;
}

interface variantColorHexColorOptions {
  [key: string]: string;
}

interface ButtonProps {
  label: string;
  variantColor: string;
  onPress(): void;
  isLoading: boolean;
}

export const Button = ({
  label,
  variantColor = 'red',
  onPress,
  isLoading,
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

  const variantColorHexColor: variantColorHexColorOptions = {
    white: 'white',
    red: '#e20b0d',
  };

  const activityIndicatorColor: variantColorHexColorOptions = {
    white: '#e20b0d',
    red: 'white',
  };

  return (
    <TouchableHighlight
      activeOpacity={0}
      onPress={onPress}
      underlayColor={variantColorHexColor[variantColor]}
      style={{...styles.button, ...variantColorStyles[variantColor].button}}>
      {isLoading ? (
        <ActivityIndicator
          animating={isLoading}
          color={activityIndicatorColor[variantColor]}
        />
      ) : (
        <Text
          style={{...styles.text, ...variantColorStyles[variantColor].text}}>
          {label}
        </Text>
      )}
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 40,
    borderRadius: 3,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  whiteButton: {
    backgroundColor: 'white',
  },
  redButton: {
    backgroundColor: '#e20b0d',
  },
  text: {
    fontSize: 16,
    textTransform: 'uppercase',
  },
  whiteButtonText: {
    color: '#e20b0d',
  },
  redButtonText: {
    color: 'white',
  },
});
