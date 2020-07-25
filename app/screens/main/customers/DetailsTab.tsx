import React from 'react';
import {ScrollView} from 'react-native';
import EmptyState from '../../../components/EmptyState';
import {applyStyles} from '../../../helpers/utils';
import {colors} from '../../../styles';

const DetailsTab = () => {
  return (
    <ScrollView style={applyStyles({backgroundColor: colors.white})}>
      <EmptyState
        heading="Coming Soon"
        source={require('../../../assets/images/coming-soon.png')}
        text="We’re working on this page right now, it’ll be available shortly."
      />
    </ScrollView>
  );
};

export default DetailsTab;
