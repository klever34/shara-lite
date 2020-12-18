import React from 'react';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';

const RecordSaleScreen = () => {
  return (
    <Page header={{iconLeft: {}, title: ' '}}>
      <TitleContainer
        title="Record Sale"
        description="Quickly record a collection or outstanding"
      />
    </Page>
  );
};

export default RecordSaleScreen;
