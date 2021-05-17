import {Button, SecureEmblem} from '@/components';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import EmblemGreen from '@/assets/images/emblem-green.svg';

const strings = getI18nService().strings;

export const BNPLNotAvailableScreen = ({onPress}: {onPress(): void}) => {
  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white center px-16')}>
      <EmblemGreen style={applyStyles('w-80 h-80')} />
      <Text
        style={applyStyles('pb-16 pt-24 text-center text-gray-200 text-base', {
          width: 320,
        })}>
        {strings('bnpl.not_available.instruction')}
      </Text>
      <TouchableOpacity style={styles.learnBtn} onPress={onPress}>
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            alignSelf: 'center',
            color: '#fff',
            fontSize: 18
          }}>
          {strings('bnpl.not_available.button_text')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  learnBtn: {
    width: '100%',
    elevation: 0,
    backgroundColor: colors['blue-100'],
    paddingVertical: 15,
    borderRadius: 6,
  },
});
