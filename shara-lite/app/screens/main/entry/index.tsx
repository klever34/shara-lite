import {TransactionEntryView} from '@/components/TransactionEntryView';
import {withModal} from '@/helpers/hocs';
import {SelectCustomerListItem} from '@/screens/main/entry/SelectCustomerScreen';
import {getAnalyticsService, getContactService} from '@/services';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';

export const TransactionEntryScreen = withModal(() => {
  const handleYouGave = useCallback(() => {
    getContactService()
      .selectContactPhone()
      .then((selection) => {
        if (!selection) {
          return;
        }
        const {contact, selectedPhone} = selection;
        const customer: SelectCustomerListItem = {
          name: contact.name,
          mobile: selectedPhone.number,
        };
        getAnalyticsService()
          .logEvent('selectContent', {
            item_id: '_id' in customer ? customer?._id?.toString() ?? '' : '',
            content_type: 'customer',
          })
          .then(() => {});
      });
  }, []);

  const handleYouCollected = useCallback(() => {}, []);

  return (
    <TransactionEntryView
      actionButtons={[
        {
          label: 'You made',
          style: applyStyles('bg-green-200'),
          textStyle: applyStyles('font-bold text-white'),
          onPress: handleYouCollected,
        },
        {
          label: 'You gave',
          style: applyStyles('bg-red-200'),
          textStyle: applyStyles('font-bold text-white'),
          onPress: handleYouGave,
        },
      ]}
    />
  );
});
