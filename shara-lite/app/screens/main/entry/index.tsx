import {TransactionEntryView} from '@/components/TransactionEntryView';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {SelectCustomerListItem} from '@/screens/main/entry/SelectCustomerScreen';
import {getAnalyticsService, getContactService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';
import {Text} from 'react-native';

export const TransactionEntryScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const navigation = useAppNavigation();

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
    }, [navigation, openModal]);

    const handleYouCollected = useCallback(
      ({amount, reset, note, showSuccessView, hideSuccessView}) => {
        const closeLoadingModal = openModal('loading', {
          text: 'Adding Transaction...',
        });
      },
      [openModal],
    );

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
  },
);
