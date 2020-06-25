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

export const Button = ({
  label,
  variantColor = 'red',
  onPress,
  isLoading,
}: any) => {
  console.log(isLoading);
  const variantColorStyles = {
    white: {
      button: styles.whiteButton,
      text: styles.whiteButtonText,
    },
    red: {
      button: styles.redButton,
      text: styles.redButtonText,
    },
  } as variantColorStylesOptions;
  const variantColorHexColor = {
    white: 'white',
    red: '#e20b0d',
  } as variantColorHexColorOptions;
  const activityIndicatorColor = {
    white: '#e20b0d',
    red: 'white',
  } as variantColorHexColorOptions;
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
