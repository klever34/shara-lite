import React from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {applyStyles} from '@/styles';
import {Button} from '@/components';

export const SuccessScreen = () => {
  return (
    <>
      <View style={applyStyles('py-64 mt-64 items-center')}>
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
          Your transaction PIN has been set succesfully
        </Text>
      </View>
      <View
        style={applyStyles('mt-64 pt-64 flex-row items-center justify-around')}>
        <Button
          title={'cancel'}
          variantColor="transparent"
          style={applyStyles('mt-32', {width: '45%'})}
        />
        <Button
          title={'Security questions'}
          style={applyStyles('mt-32', {width: '45%'})}
        />
      </View>
    </>
  );
};
