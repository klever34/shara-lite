import EmptyState from '@/components/EmptyState';
import {applyStyles} from '@/helpers/utils';
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
