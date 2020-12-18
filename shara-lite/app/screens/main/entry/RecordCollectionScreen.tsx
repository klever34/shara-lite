import React from 'react';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';

const RecordCollectionScreen = () => {
  return (
    <Page header={{iconLeft: {}, title: ' '}}>
      <TitleContainer
        title="Record Collection"
        description="Quickly record a transaction or obligation"
      />
    </Page>
  );
};

export default RecordCollectionScreen;
