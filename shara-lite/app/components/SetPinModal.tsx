import {applyStyles} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';
import Touchable from './Touchable';

export const SetPinModal = () => {
  return (
    <View style={applyStyles('px-16 flex-1 justify-between')}>
      <View></View>
      <View></View>
      <View>
        <Touchable>
          <View style={applyStyles('py-8 mb-4')}>
            <Text style={applyStyles('text-uppercase text-secondary text-400')}>
              set withdrawal pin
            </Text>
          </View>
        </Touchable>
        <Touchable>
          <View style={applyStyles('py-8')}>
            <Text style={applyStyles('text-uppercase text-gray-300 text-400')}>
              set withdrawal pin
            </Text>
          </View>
        </Touchable>
      </View>
    </View>
  );
};
