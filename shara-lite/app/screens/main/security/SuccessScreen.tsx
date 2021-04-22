import React from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {applyStyles} from '@/styles';

export const SuccessScreen = ({onDone, renderButtons}: any) => {
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
          Your transaction PIN has been set succesfully
        </Text>
      </View>

      {renderButtons(onDone)}
    </>
  );
};
