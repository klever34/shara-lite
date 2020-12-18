import React from 'react';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import {AppInput} from '@/components';
import {CalculatorInput, CalculatorView} from '@/components/CalculatorView';

const RecordCollectionScreen = () => {
  return (
    <CalculatorView>
      <Page header={{iconLeft: {}, title: ' '}}>
        <TitleContainer
          title="Record Collection"
          description="Quickly record a transaction or obligation"
        />
        <CalculatorInput />
        <AppInput />
      </Page>
    </CalculatorView>
  );
};

export default RecordCollectionScreen;
