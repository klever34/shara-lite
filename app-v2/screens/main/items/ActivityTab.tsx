import EmptyState from 'app-v2/components/EmptyState';
import {applyStyles} from 'app-v2/helpers/utils';
import React from 'react';
import {SafeAreaView} from 'react-native';

export const ActivityTab = () => {
  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <EmptyState
        heading="Coming Soon"
        text="This feature is coming in the next release"
      />
    </SafeAreaView>
  );
};
