import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {Text} from '@/components';
import {as} from '@/styles';
import Touchable from './Touchable';

type TabBarOption = {label: string; value: string};

export type TabBarProps = {
  options: TabBarOption[];
  onChangeOption: (option: TabBarOption) => void;
};

export const TabBar = ({options, onChangeOption}: TabBarProps) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const onTabPress = useCallback(
    (option: TabBarOption) => {
      setSelectedOption(option);
      onChangeOption(option);
    },
    [onChangeOption],
  );
  return (
    <View
      style={as(
        'flex-row bg-gray-20 rounded-16 self-center overflow-hidden p-1',
      )}>
      {options.map((option) => {
        const isSelected = option.value === selectedOption.value;
        return (
          <Touchable
            onPress={() => {
              onTabPress(option);
            }}>
            <View
              style={as(isSelected ? 'bg-white' : '', 'rounded-16 py-4 px-12')}>
              <Text
                style={as(
                  isSelected ? 'text-black font-bold' : 'text-gray-200',
                )}>
                {option.label}
              </Text>
            </View>
          </Touchable>
        );
      })}
    </View>
  );
};
