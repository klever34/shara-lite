import React from 'react';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import {AppInput, Button, DatePicker} from '@/components';
import {CalculatorView} from '@/components/CalculatorView';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '@/screens/main';
import {applyStyles, colors} from '@/styles';
import {CustomerListItem} from '@/components/CustomerListItem';
import Touchable from '@/components/Touchable';
import {View, Text} from 'react-native';
import {format} from 'date-fns';
import {Icon} from '@/components/Icon';
import {useFormik} from 'formik';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {getAuthService} from '@/services';

type RecordCollectionScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordCollection'>;
};

const RecordCollectionScreen = ({route}: RecordCollectionScreenProps) => {
  const {customer} = route.params;
  const {handleSubmit, values, handleChange} = useFormik({
    initialValues: {
      amount: '0',
      note: '',
      date: new Date(),
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });
  const currency = getAuthService().getUserCurrency();
  return (
    <CalculatorView>
      <Page header={{iconLeft: {}, title: ' '}}>
        <TitleContainer
          title="Record Collection"
          description="Quickly record a transaction or obligation"
          containerStyle={applyStyles('mb-8')}
        />
        <CustomerListItem
          customer={customer}
          containerStyle={applyStyles('py-16 mb-16')}
        />
        <AppInput
          label="Enter Amount"
          containerStyle={applyStyles('mb-16')}
          keyboardType="number-pad"
          leftIcon={
            <Text style={applyStyles('text-400 text-lg')}>{currency}</Text>
          }
          value={numberWithCommas(Number(values.amount))}
          onChangeText={handleChange('amount')}
        />
        {!!Number(values.amount) && (
          <AppInput
            label="Note (Optional)"
            containerStyle={applyStyles('mb-24')}
            onChangeText={handleChange('note')}
            placeholder="Write a brief note about this transaction"
            multiline
          />
        )}
        <View style={applyStyles('flex-row items-end')}>
          <DatePicker
            value={new Date(values.date)}
            containerStyle={applyStyles('flex-1 mr-16')}
            onChange={(e: Event, date?: Date) => {
              handleChange('date')((date ?? new Date()).toISOString());
            }}>
            {(toggleShow) => {
              return (
                <>
                  <Text
                    style={applyStyles(
                      'text-xs text-500 text-gray-100 pb-8 flex-1',
                    )}>
                    Date
                  </Text>
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
                        {format(new Date(values.date), 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  </Touchable>
                </>
              );
            }}
          </DatePicker>
          <Button
            title="Save"
            style={applyStyles('flex-1 ml-16')}
            onPress={handleSubmit}
          />
        </View>
      </Page>
    </CalculatorView>
  );
};

export default RecordCollectionScreen;
