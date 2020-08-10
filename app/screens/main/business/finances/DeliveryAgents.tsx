import React from 'react';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import EmptyState from '../../../../components/EmptyState';
import {ScrollView} from 'react-native';
import {useScreenRecord} from '../../../../services/analytics';

export const DeliveryAgents = () => {
  useScreenRecord();
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
