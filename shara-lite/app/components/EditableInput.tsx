import {mergeRefs} from '@/helpers/utils';
import {applyStyles} from '@/styles';
import React, {forwardRef, useCallback, useRef, useState} from 'react';
import {Text, TextInput, TextStyle, View, ViewStyle} from 'react-native';
import {AppInput, AppInputProps} from './AppInput';
import Touchable from './Touchable';

export type EditableInputProps = {
  labelStyle?: TextStyle;
  contentStyle?: ViewStyle;
} & AppInputProps;

export const EditableInput = forwardRef<TextInput, EditableInputProps>(
  (props, ref) => {
    const {style, contentStyle, label, labelStyle, ...rest} = props;
    const inputRef = useRef<any>(null);

    const [focused, setFocused] = useState(false);

    const [height, setHeight] = useState(style?.height);

    const handleInputFocus = useCallback(() => {
      setFocused(true);
      inputRef?.current?.focus();
    }, []);

    const handleInputBlur = useCallback(() => {
      setFocused(false);
      inputRef?.current?.blur();
    }, []);

    const handleHeightUpdate = useCallback((e) => {
      const newHeight = e.nativeEvent.contentSize.height;
      setHeight(newHeight);
    }, []);

    return (
      <View style={contentStyle}>
        {!focused ? (
          <Touchable onPress={handleInputFocus}>
            <Text numberOfLines={1} style={applyStyles(labelStyle)}>
              {rest.value || label}
            </Text>
          </Touchable>
        ) : (
          <AppInput
            autoFocus
            onBlur={handleInputBlur}
            ref={mergeRefs([inputRef, ref])}
            onContentSizeChange={handleHeightUpdate}
            style={applyStyles(style, {height})}
            {...rest}
          />
        )}
      </View>
    );
  },
);
