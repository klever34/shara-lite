import {HeaderBackButton} from '@/components/HeaderBackButton';
import {applyStyles} from '@/styles';
import React from 'react';
import {SafeAreaView, View} from 'react-native';

export const ReminderSettingsScreen = () => {
  return (
    <SafeAreaView style={applyStyles('flex-1 bg-gray-20')}>
      <View style={applyStyles('p-16 flex-row items-center')}>
        <HeaderBackButton />
      </View>
    </SafeAreaView>
  );
};
