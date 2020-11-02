import {applyStyles, colors} from '@/styles';
import React, {ReactNode} from 'react';
import {
  TextInput,
  View,
  TextInputProps,
  ViewStyle,
  Text,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import {Icon} from './Icon';

export type AppInputProps = {
  label?: string;
  style?: ViewStyle;
  isInvalid?: boolean;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  leftIcon?: ReactNode | string;
  rightIcon?: ReactNode | string;
} & TextInputProps;

export const AppInput = (props: AppInputProps) => {
  const {
    style,
    label,
    onBlur,
    onFocus,
    leftIcon,
    isInvalid,
    rightIcon,
    errorMessage,
    containerStyle,
    ...rest
  } = props;
  const withLeftIconStyle = leftIcon
    ? applyStyles('pl-56')
    : applyStyles('pl-16');
  const withRightIconStyle = rightIcon
    ? applyStyles('pr-56')
    : applyStyles('p4-16');

  const handleFocus = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onFocus && onFocus(e);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onBlur && onBlur(e);
    },
    [onBlur],
  );

  return (
    <View style={applyStyles(containerStyle)}>
      <Text
        style={applyStyles(
          'text-xs text-uppercase text-500 text-gray-100 pb-8',
        )}>
        {label}
      </Text>
      <View>
        {leftIcon && (
          <View
            style={applyStyles('flex-row center', {
              position: 'absolute',
              left: 12,
              top: 16,
              zIndex: 10,
            })}>
            {typeof leftIcon === 'string' ? (
              <Icon
                size={24}
                name={leftIcon}
                type="feathericons"
                color={colors['gray-50']}
              />
            ) : (
              leftIcon
            )}
          </View>
        )}
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={applyStyles(
            'text-500',
            {
              height: 56,
              fontSize: 16,
              borderRadius: 8,
              borderColor: colors['gray-10'],
              backgroundColor: colors['gray-10'],
            },
            withLeftIconStyle,
            withRightIconStyle,
            style,
          )}
          {...rest}
        />
        {rightIcon && (
          <View
            style={applyStyles('flex-row center', {
              position: 'absolute',
              right: 12,
              top: 16,
              zIndex: 10,
            })}>
            {typeof rightIcon === 'string' ? (
              <Icon
                size={24}
                name={rightIcon}
                type="feathericons"
                color={colors['gray-50']}
              />
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>
      {isInvalid && (
        <Text style={applyStyles('text-500 text-xs pt-2 text-red-200')}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};
