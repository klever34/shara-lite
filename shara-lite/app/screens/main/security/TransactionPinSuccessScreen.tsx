import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {applyStyles} from '@/styles';
import {getI18nService} from '@/services';
import {Button} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {SecurityContext} from './context';

const strings = getI18nService().strings;
export const TransactionPinSuccessScreen = () => {
  const navigation = useAppNavigation();
  const {setPinSet} = useContext(SecurityContext);
  return (
    <>
      <View style={applyStyles('py-80 mt-80 items-center')}>
        <View style={applyStyles('py-20')}>
          <LottieView
            autoPlay
            style={applyStyles({width: 50})}
            source={require('@/assets/animations/success.json')}
          />
        </View>
        <Text style={applyStyles('text-black text-400 text-2xl text-center')}>
          Success
        </Text>
        <Text
          style={applyStyles(
            'text-gray-300 text-400 text-lg text-center mt-16',
            {
              width: '60%',
            },
          )}>
          {strings('withdrawal_pin.success_message')}
        </Text>
      </View>

      <View
        style={applyStyles('mt-32 pt-32 flex-row items-center justify-around')}>
        <Button
          title={strings('done')}
          style={applyStyles('mt-32', {width: '45%'})}
          onPress={() => {
            setPinSet?.(true);
            navigation.navigate('SecurityOptions');
          }}
        />
      </View>
    </>
  );
};
