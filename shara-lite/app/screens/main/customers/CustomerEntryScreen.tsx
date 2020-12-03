import React from 'react';
import {Header} from '@/components';
import {EntryView} from '@/components/EntryView';

export const CustomerEntryScreen = () => {
  return (
    <>
      <Header iconLeft={{iconName: 'x'}} title=" " />
      <EntryView showLastTransactions={false} />
    </>
  );
};
