import React from 'react';
import {Text} from '@/components';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import {applyStyles, colors} from '../styles';

export type FloatingLabelInputProps = {
  label?: string;
  isInvalid?: boolean;
  containerStyle?: any;
  errorMessage?: string;
  labelStyle?: TextStyle;
  inputStyle?: {
    [key: string]: any;
  };
  leftIcon?: React.ReactNode | string;
} & TextInputProps;

export const FlatFloatingLabelInput = (props: FloatingLabelInputProps) => {
  return (
    <View style={applyStyles('bg-gray-20')}>
      <FloatingLabelInput
        labelStyle={applyStyles('px-24', props.labelStyle)}
        inputStyle={applyStyles('px-24', props.inputStyle)}
        {...props}
      />
    </View>
  );
};

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
    labelStyle: labelStyleProp,
    ...rest
  } = props;
  const [isFocused, setIsFocused] = React.useState(false);
  const [focusedStyles, setFocusedStyles] = React.useState({});
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
    ...labelStyleProp,
    position: 'absolute',
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

  if (rest.editable === false) {
    inputFieldStyle = {...styles.inputField, ...styles.inputFieldDisabled};
  }

  if (leftIcon) {
    inputFieldStyle = {...styles.inputField, ...withLeftIconStyle};
  }

  const handleFocus = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      setFocusedStyles({
        borderBottomWidth: 2,
        borderBottomColor: colors['green-300'],
      });
      onFocus && onFocus(e);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      setFocusedStyles({});
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
        style={applyStyles(
          'text-400',
          inputFieldStyle,
          focusedStyles,
          inputStyle,
        )}
      />
      {isInvalid && (
        <Text
          style={applyStyles('text-400 pt-xs', {
            fontSize: 12,
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
    borderBottomColor: colors['gray-20'],
  },
  inputIcon: {
    top: 33,
    position: 'absolute',
  },
  inputFieldDisabled: {
    opacity: 0.5,
  },
});
