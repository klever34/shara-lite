import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {applyStyles} from '../../../helpers/utils';

const Finances = () => {
  return (
    <View style={applyStyles('flex-1', 'justify-center', 'items-center')}>
      <Text style={styles.heading}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Finances;
