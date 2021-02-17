import {applySpacing, applyStyles, colors} from '@/styles';
import React from 'react';
import {View, TextInput, ViewStyle} from 'react-native';
import {Icon} from '../Icon';
import Touchable from '../Touchable';

type SearchFilterProps = {
  value?: string;
  inputStyle?: ViewStyle;
  placeholderText?: string;
  onClearInput?: () => void;
  containerStyle?: ViewStyle;
  onSearch?: (text: string) => void;
};

export const SearchFilter = ({
  value,
  onSearch,
  inputStyle,
  onClearInput,
  containerStyle,
  placeholderText = 'Search',
}: SearchFilterProps) => {
  return (
    <View
      style={applyStyles(
        'bg-white',
        {
          zIndex: 10,
        },
        containerStyle,
      )}>
      <View>
        <View
          style={applyStyles('flex-row center', {
            position: 'absolute',
            left: 12,
            top: 9,
            zIndex: 10,
          })}>
          <Icon
            size={20}
            name="search"
            type="feathericons"
            color={colors['gray-50']}
          />
        </View>
        <TextInput
          value={value}
          style={applyStyles(
            'px-40 text-400 text-lg bg-white ml-12',
            {
              height: applySpacing(40),
            },
            inputStyle,
          )}
          onChangeText={onSearch}
          placeholder={placeholderText}
        />
        {!!value && onClearInput && (
          <Touchable onPress={onClearInput}>
            <View
              style={applyStyles('flex-row center', {
                top: 10,
                right: 12,
                zIndex: 10,
                position: 'absolute',
              })}>
              <Icon
                size={20}
                name="delete"
                type="feathericons"
                color={colors['gray-50']}
              />
            </View>
          </Touchable>
        )}
      </View>
    </View>
  );
};
