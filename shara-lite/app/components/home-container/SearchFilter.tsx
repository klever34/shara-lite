import {applyStyles, colors} from '@/styles';
import React from 'react';
import {View, TextInput} from 'react-native';
import {Icon} from '../Icon';
import Touchable from '../Touchable';

type SearchFilterProps = {
  value?: string;
  onClearInput?: () => void;
  placeholderText?: string;
  onSearch?: (text: string) => void;
};

export const SearchFilter = ({
  value,
  onSearch,
  onClearInput,
  placeholderText = 'Search',
}: SearchFilterProps) => {
  return (
    <View
      style={applyStyles('px-16 py-8 bg-gray-10', {
        zIndex: 10,
      })}>
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
          style={applyStyles('px-40 text-400 bg-white', {
            height: 40,
            fontSize: 16,
            borderWidth: 1.5,
            borderRadius: 8,
            borderColor: colors['gray-10'],
          })}
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
                name="x-circle"
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
