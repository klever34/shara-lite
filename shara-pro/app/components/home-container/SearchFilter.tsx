import {applyStyles, colors} from '@/styles';
import React from 'react';
import {View, TextInput} from 'react-native';
import {Icon} from '../Icon';
import Touchable from '../Touchable';

type SearchFilterProps = {
  onOpenFilter?: () => void;
  placeholderText?: string;
  onSearch?: (text: string) => void;
};

export const SearchFilter = ({
  onSearch,
  onOpenFilter,
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
        {onOpenFilter && (
          <Touchable onPress={onOpenFilter}>
            <View
              style={applyStyles('flex-row center', {
                position: 'absolute',
                right: 12,
                top: 10,
                zIndex: 10,
              })}>
              <Icon
                size={20}
                name="sliders"
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
