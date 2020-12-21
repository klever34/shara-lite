import {Page} from '@/components/Page';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {TitleContainer} from '@/components/TitleContainer';
// import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';

const RecordSaleScreen = () => {
  // const navigation = useAppNavigation();
  const handleSave = useCallback((payload) => {
    console.log(payload);
  }, []);
  return (
    <Page header={{iconLeft: {}, title: ' '}}>
      <TitleContainer
        title="Record Sale"
        containerStyle={applyStyles('pb-24')}
        description="Quickly record a collection or outstanding"
      />
      <RecordSaleForm onSubmit={handleSave} />
    </Page>
  );
};

export default RecordSaleScreen;
