import {applyStyles, colors} from '@/styles';
import React, {ReactElement, ReactNode, useState, forwardRef} from 'react';
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
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import Touchable from './Touchable';
import mergeRefs from '../helpers/utils';

export type AppInputProps = {
  label?: string;
  action?: ReactElement;
  style?: ViewStyle;
  isInvalid?: boolean;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  leftIcon?: ReactNode | string;
  rightIcon?: ReactNode | string;
} & TextInputProps;

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (props: AppInputProps, inputRef) => {
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
      action = null,
      ...rest
    } = props;
    const [bgStyle, setBgStyle] = useState({} as ViewStyle);

    const withLeftIconStyle = leftIcon
      ? applyStyles('pl-56')
      : applyStyles('pl-16');
    const withRightIconStyle = rightIcon
      ? applyStyles('pr-56')
      : applyStyles('pr-16');

    const localInputRef = React.useRef<any>(null);

    const handleFocus = React.useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setBgStyle({
          borderWidth: 2,
          borderColor: colors['red-50'],
        });
        onFocus && onFocus(e);
      },
      [onFocus],
    );

    const handleBlur = React.useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setBgStyle({
          borderWidth: 2,
          borderColor: colors['gray-20'],
        });
        onBlur && onBlur(e);
      },
      [onBlur],
    );

    return (
      <KeyboardAwareScrollView
        style={applyStyles(containerStyle)}
        getTextInputRefs={() => [inputRef]}>
        <View style={applyStyles('flex-row')}>
          {!!label && (
            <Text
              style={applyStyles(
                'text-xs text-uppercase text-500 text-gray-100 pb-8 flex-1',
              )}>
              {label}
            </Text>
          )}
          {action}
        </View>
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
                <Touchable
                  onPress={() => {
                    localInputRef?.current?.focus();
                  }}>
                  <Icon
                    size={24}
                    name={leftIcon}
                    type="feathericons"
                    color={colors['gray-50']}
                  />
                </Touchable>
              ) : (
                leftIcon
              )}
            </View>
          )}
          <TextInput
            ref={mergeRefs([localInputRef, inputRef])}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={applyStyles(
              'text-500 bg-white',
              {
                height: 56,
                fontSize: 16,
                borderWidth: 2,
                borderRadius: 8,
                borderColor: colors['gray-20'],
              },
              bgStyle,
              withLeftIconStyle,
              withRightIconStyle,
              style,
            )}
            placeholderTextColor={colors['gray-50']}
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
                <Touchable
                  onPress={() => {
                    localInputRef?.current?.focus();
                  }}>
                  <Icon
                    size={24}
                    name={rightIcon}
                    type="feathericons"
                    color={colors['gray-50']}
                  />
                </Touchable>
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
      </KeyboardAwareScrollView>
    );
  },
);
