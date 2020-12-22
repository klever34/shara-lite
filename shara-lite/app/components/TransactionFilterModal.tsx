import {FilterOption} from '@/screens/main/transactions/hook';
import {applyStyles, colors} from '@/styles';
import {endOfDay, format, startOfDay} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import {RadioButton, RadioGroup} from 'react-native-ui-lib';
import {Button} from './Button';
import {DatePicker} from './DatePicker';
import {Icon} from './Icon';
import Touchable from './Touchable';

type TransactionFilterModalProps = {
  onClose: () => void;
  initialFilter: string;
  options?: FilterOption[];
  onDone: (payload: {status: string; startDate?: Date; endDate?: Date}) => void;
};

export const TransactionFilterModal = ({
  options,
  onDone,
  onClose,
  initialFilter,
}: TransactionFilterModalProps) => {
  const [filter, setFilter] = useState(initialFilter);
  const initialFilterOption = options?.find(
    (option) => option.value === initialFilter,
  );
  const [filterStartDate, setFilterStartDate] = useState(
    initialFilterOption?.startDate ?? startOfDay(new Date()),
  );
  const [filterEndDate, setFilterEndDate] = useState(
    initialFilterOption?.endDate ?? endOfDay(new Date()),
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      const filterOption = options?.find((option) => option.value === status);
      if (filterOption) {
        const {value, startDate, endDate} = filterOption;
        setFilter(value);
        if (startDate && endDate) {
          setFilterStartDate(startDate);
          setFilterEndDate(endDate);
        }
      }
    },
    [options],
  );

  const handleDone = useCallback(() => {
    onDone({
      status: filter,
      startDate: filterStartDate,
      endDate: filterEndDate,
    });
    onClose();
  }, [filter, filterStartDate, filterEndDate, onDone, onClose]);

  const handleClear = useCallback(() => {
    onDone({
      status: 'all',
    });
    onClose();
  }, [onDone, onClose]);

  return (
    <View style={applyStyles('p-16 pt-0')}>
      {filter !== 'date-range' ? (
        <RadioGroup
          initialValue={initialFilter}
          onValueChange={handleStatusFilter}>
          {options?.map(({text, value}, index) => {
            const isActive = value === filter;
            return (
              <View
                key={`${value}-${index}`}
                style={applyStyles(
                  'pt-16 flex-row items-center justify-between',
                )}>
                <Text style={applyStyles('text-400 text-base')}>{text}</Text>
                <RadioButton
                  value={value}
                  selected={isActive}
                  color={isActive ? colors['red-200'] : colors['gray-50']}
                />
              </View>
            );
          })}
        </RadioGroup>
      ) : (
        <View
          style={applyStyles('pt-24 flex-row items-center justify-between')}>
          <View style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
              Start Date
            </Text>
            <DatePicker
              //@ts-ignore
              maximumDate={new Date()}
              value={filterStartDate ?? new Date()}
              onChange={(e: Event, date?: Date) =>
                date && setFilterStartDate(date)
              }>
              {(toggleShow) => (
                <Touchable onPress={toggleShow}>
                  <View
                    style={applyStyles('px-8 py-16 flex-row items-center', {
                      borderWidth: 2,
                      borderRadius: 8,
                      borderColor: colors['gray-20'],
                    })}>
                    <Icon
                      size={16}
                      name="calendar"
                      type="feathericons"
                      color={colors['gray-50']}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm text-xs text-uppercase text-700 text-gray-300',
                      )}>
                      {format(filterStartDate, 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </Touchable>
              )}
            </DatePicker>
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
              End Date
            </Text>
            <DatePicker
              //@ts-ignore
              maximumDate={new Date()}
              value={filterEndDate ?? new Date()}
              onChange={(e: Event, date?: Date) =>
                date && setFilterEndDate(date)
              }>
              {(toggleShow) => (
                <Touchable onPress={toggleShow}>
                  <View
                    style={applyStyles('px-8 py-16 flex-row items-center', {
                      borderWidth: 2,
                      borderRadius: 8,
                      borderColor: colors['gray-20'],
                    })}>
                    <Icon
                      size={16}
                      name="calendar"
                      type="feathericons"
                      color={colors['gray-50']}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm text-xs text-uppercase text-700 text-gray-300',
                      )}>
                      {format(filterEndDate, 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </Touchable>
              )}
            </DatePicker>
          </View>
        </View>
      )}
      <View style={applyStyles('pt-24 flex-row items-center justify-between')}>
        <Button
          title="Clear filter"
          onPress={handleClear}
          variantColor="transparent"
          style={applyStyles({width: '48%'})}
        />
        <Button
          title="Done"
          onPress={handleDone}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </View>
  );
};
