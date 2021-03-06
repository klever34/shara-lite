import React from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
  Text,
} from 'react-native';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';

export type FloatingLabelInputProps = {
  label?: string;
  isInvalid?: boolean;
  containerStyle?: any;
  errorMessage?: string;
  inputStyle?: {
    [key: string]: any;
  };
  leftIcon?: React.ReactNode | string;
} & TextInputProps;

export const FloatingLabelInput = (props: FloatingLabelInputProps) => {
  const {
    value,
    label,
    onBlur,
    onFocus,
    leftIcon,
    isInvalid,
    inputStyle,
    errorMessage,
    containerStyle,
    ...rest
  } = props;
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedIsFocused = new Animated.Value(!value ? 0 : 1);

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      duration: 200,
      useNativeDriver: false,
      toValue: isFocused || value ? 1 : 0,
    }).start();
  }, [value, animatedIsFocused, isFocused]);

  const labelStyle = {
    left: 2,
    position: 'absolute',
    fontFamily: 'Rubik-Regular',
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [32, 10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors['gray-50'], colors['gray-100']],
    }),
  } as any;

  const withLeftIconStyle = {
    paddingLeft: 20,
  };

  let inputFieldStyle = styles.inputField;

  if (leftIcon) {
    inputFieldStyle = {...styles.inputField, ...withLeftIconStyle};
  }

  const handleFocus = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus && onFocus(e);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur && onBlur(e);
    },
    [onBlur],
  );

  const showLeftIcon = leftIcon && (value || isFocused);

  return (
    <View style={applyStyles(styles.container, containerStyle)}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {showLeftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}

      <TextInput
        {...rest}
        value={value}
        onBlur={handleBlur}
        onFocus={handleFocus}
        style={applyStyles('text-400', inputFieldStyle, inputStyle)}
      />
      {isInvalid && (
        <Text
          style={applyStyles('text-500 pt-xs', {
            fontSize: 14,
            color: colors['red-200'],
          })}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '100%', paddingTop: 18},
  inputField: {
    width: '100%',
    fontSize: 18,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-300'],
  },
  inputIcon: {
    top: 33,
    position: 'absolute',
  },
});
