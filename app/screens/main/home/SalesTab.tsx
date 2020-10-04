import {FilterButton, FilterButtonGroup} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import React, {useCallback, useState} from 'react';
import {KeyboardAvoidingView, Text, View} from 'react-native';

const filters = [
  {label: 'All Sales', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Pending', value: 'pending'},
  {label: 'Cancelled', value: 'cancelled'},
];

export const SalesTab = () => {
  const [filter, setFilter] = useState(filters[0].value || '');

  const handleFilterChange = useCallback((value) => {
    setFilter(value);
  }, []);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <FilterButtonGroup value={filter} onChange={handleFilterChange}>
        <View
          style={applyStyles(
            'py-xl px-sm flex-row center justify-space-between',
          )}>
          {filters.map((filterItem, index) => (
            <FilterButton
              {...filterItem}
              key={`${filterItem.value}-${index}`}
              isChecked={filter === filterItem.value}
            />
          ))}
        </View>
      </FilterButtonGroup>
      <View
        style={applyStyles('p-xl center flex-row justify-space-between', {
          backgroundColor: colors['gray-300'],
        })}>
        <View />
        <View>
          <Text style={applyStyles('text-400', {color: colors.white})}>
            You sold
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
