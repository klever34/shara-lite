import {AppInput, Button, CurrencyInput, DatePicker} from '@/components';
import {CalculatorView} from '@/components/CalculatorView';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import Touchable from '@/components/Touchable';
import {MainStackParamList} from '@/screens/main';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {useFormik} from 'formik';
import React from 'react';
import {Text, View} from 'react-native';

type RecordCollectionScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordCollection'>;
};

const RecordCollectionScreen = ({route}: RecordCollectionScreenProps) => {
  const {customer} = route.params;
  const {handleSubmit, values, handleChange} = useFormik({
    initialValues: {
      note: '',
      amount: 0,
      date: new Date(),
    },
    onSubmit: (payload) => {
      console.log(payload);
    },
  });
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
        <CurrencyInput
          label="Enter Amount"
          value={values.amount}
          containerStyle={applyStyles('mb-16')}
          onChangeText={handleChange('amount')}
        />
        {!!values.amount && (
          <AppInput
            label="Note (Optional)"
            containerStyle={applyStyles('mb-24')}
            onChangeText={handleChange('note')}
            placeholder="Write a brief note about this transaction"
            multiline
          />
        )}
        <View style={applyStyles('flex-row items-end justify-between')}>
          <DatePicker
            value={new Date(values.date)}
            containerStyle={applyStyles({width: '48%'})}
            onChange={(e: Event, date?: Date) => {
              handleChange('date')((date ?? new Date()).toISOString());
            }}>
            {(toggleShow) => {
              return (
                <>
                  <Text
                    style={applyStyles(
                      'text-sm text-500 text-gray-50 pb-8 flex-1',
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
            onPress={handleSubmit}
            style={applyStyles({width: '48%'})}
          />
        </View>
      </Page>
    </CalculatorView>
  );
};

export default RecordCollectionScreen;
