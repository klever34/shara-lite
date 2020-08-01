import React from 'react';
import EmptyState from '../../../../components/EmptyState';
import {applyStyles} from '../../../../helpers/utils';
import {ScrollView} from 'react-native';
import {colors} from '../../../../styles';

export function MyInventory() {
  return (
    <ScrollView style={applyStyles({backgroundColor: colors['gray-10']})}>
      <EmptyState
        heading="Coming Soon"
        source={require('../../../../assets/images/coming-soon.png')}
        text="We’re working on this page right now, it’ll be available shortly."
      />
    </ScrollView>
  );
}
