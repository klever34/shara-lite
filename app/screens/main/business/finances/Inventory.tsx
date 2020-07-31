import React from 'react';
import EmptyState from '../../../../components/EmptyState';

export function MyInventory() {
  return (
    <EmptyState
      heading="Coming Soon"
      source={require('../../../../assets/images/coming-soon.png')}
      text="We’re working on this page right now, it’ll be available shortly."
    />
  );
}
