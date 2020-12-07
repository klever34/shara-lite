import React from 'react';
import {applyStyles} from 'app-v1/helpers/utils';
import {colors} from 'app-v1/styles';
import EmptyState from '../../../../components/EmptyState';
import {ScrollView} from 'react-native';

export const Expenses = () => {
  return (
    <ScrollView style={applyStyles({backgroundColor: colors['gray-10']})}>
      <EmptyState
        heading="Coming Soon"
        source={require('../../../../assets/images/coming-soon.png')}
        text="We’re working on this page right now, it’ll be available shortly."
      />
    </ScrollView>
  );
};
