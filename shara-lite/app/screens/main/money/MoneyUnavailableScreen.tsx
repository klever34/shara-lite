import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {AppInput, Text, Button} from '@/components';
import {getI18nService} from '@/services';
import {as} from '@/styles';

const strings = getI18nService().strings;

export const MoneyUnavailableScreen = () => {
  return (
    <SafeAreaView style={as('flex-1 justify-center px-16')}>
      <View>
        <Text style={as('text-center font-bold text-2xl mb-8')}>
          {strings('payment_activities.not_available.title')}
        </Text>
        <Text style={as('text-center leading-24 mb-32')}>
          {strings('payment_activities.not_available.description')}
        </Text>
        <AppInput
          style={as('mb-16')}
          label={strings(
            'payment_activities.not_available.fields.method_of_disbursement.label',
          )}
        />
        <Button title={strings('submit')} />
      </View>
    </SafeAreaView>
  );
};
