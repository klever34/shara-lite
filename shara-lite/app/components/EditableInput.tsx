import {mergeRefs} from '@/helpers/utils';
import {applyStyles} from '@/styles';
import React, {forwardRef, useCallback, useRef, useState} from 'react';
import {Text, TextInput, TextStyle, View} from 'react-native';
import {AppInput, AppInputProps} from './AppInput';
import Touchable from './Touchable';

export type EditableInputProps = {
  labelStyle?: TextStyle;
} & AppInputProps;

export const EditableInput = forwardRef<TextInput, EditableInputProps>(
  (props, ref) => {
    const {style, label, labelStyle, ...rest} = props;
    const inputRef = useRef<any>(null);

    const [focused, setFocused] = useState(false);

    const handleInputFocus = useCallback(() => {
      setFocused(true);
      console.log(inputRef.current);
      inputRef?.current?.focus();
    }, []);

    const handleInputBlur = useCallback(() => {
      setFocused(false);
      inputRef?.current?.blur();
    }, []);

    return (
      <View style={style}>
        {!focused ? (
          <Touchable onPress={handleInputFocus}>
            <Text numberOfLines={1} style={applyStyles(labelStyle)}>
              {rest.value || label}
            </Text>
          </Touchable>
        ) : (
          <AppInput
            ref={mergeRefs([inputRef, ref])}
            onBlur={handleInputBlur}
            {...rest}
          />
        )}
      </View>
    );
  },
);
