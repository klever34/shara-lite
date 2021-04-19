import {applyStyles, colors} from '@/styles';
import {endOfDay, format, startOfDay} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {Text} from '@/components';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Button} from './Button';
import {DatePicker} from './DatePicker';
import {Icon} from './Icon';
import {RadioButton} from './RadioButton';
import Touchable from './Touchable';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type TransactionFilterModalProps = {
  onClose: () => void;
  initialFilter?: string;
  options?: FilterOption[];
  onDone: (payload: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
};

export type FilterOption = {
  text: string;
  value: string;
  endDate?: Date;
  startDate?: Date;
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

  const renderContent = useCallback(() => {
    switch (filter) {
      case 'date-range':
        return (
          <View
            style={applyStyles('pt-24 flex-row items-center justify-between')}>
            <View style={applyStyles({width: '48%'})}>
              <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
                {strings('start_date')}
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
                {strings('end_date')}
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
        );

      case 'single-day':
        return (
          <View style={applyStyles('pt-24')}>
            <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
              {strings('date')}
            </Text>
            <DatePicker
              //@ts-ignore
              maximumDate={new Date()}
              value={filterStartDate ?? new Date()}
              onChange={(e: Event, date?: Date) => {
                date && setFilterStartDate(startOfDay(date));
                date && setFilterEndDate(endOfDay(date));
              }}>
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
        );

      default:
        return (
          <>
            {options?.map(({text, value}, index) => {
              const isActive = value === filter;
              return (
                <View
                  key={`${value}-${index}`}
                  style={applyStyles(
                    'pt-16 flex-row items-center justify-between',
                  )}>
                  <RadioButton
                    isChecked={isActive}
                    style={applyStyles('rounded-24')}
                    checkedStyle={applyStyles('rounded-24')}
                    onChange={() => handleStatusFilter(value)}>
                    <Text
                      style={applyStyles(
                        'text-base text-black',
                        isActive ? 'text-700' : 'text-400',
                      )}>
                      {text}
                    </Text>
                  </RadioButton>
                </View>
              );
            })}
          </>
        );
    }
  }, [filter, options, filterEndDate, filterStartDate, handleStatusFilter]);

  return (
    <View style={applyStyles('p-16 pt-0')}>
      {renderContent()}
      <View style={applyStyles('flex-row justify-between items-center w-full mt-20 mb-20')}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => handleClear()}>
          <Text style={{fontFamily: 'Roboto-Medium', alignSelf: 'center'}}>
            Clear Filter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={() => handleDone()}>
          <Text
            style={{
              fontFamily: 'Roboto-Medium',
              alignSelf: 'center',
              color: '#fff',
            }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skipBtn: {
    width: '47%',
    elevation: 0,
    borderWidth: 1.5,
    borderColor: colors['gray-20'],
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 6,
  },
  nextBtn: {
    width: '47%',
    elevation: 0,
    backgroundColor: colors['blue-100'],
    paddingVertical: 15,
    borderRadius: 6,
  },
});
