import {View} from 'react-native';
import React from 'react';
import {applyStyles} from '@/helpers/utils';
import EmptyState from '@/components/EmptyState';

export const ItemsTab = () => {
  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <EmptyState
        heading="Coming Soon"
        text="This feature is coming in the next update"
      />
    </View>
  );
};
