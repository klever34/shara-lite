import EmptyState from 'app-v3/components/EmptyState';
import React from 'react';
import {SafeAreaView} from 'react-native';
import {applyStyles} from 'app-v3/styles';

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
