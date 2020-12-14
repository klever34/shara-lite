import React, {useCallback} from 'react';
import {Text} from 'react-native';
import {TransactionEntryView} from '@/components/TransactionEntryView';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {handleError} from '@/services/error-boundary';
import {SelectCustomerListItem} from '@/screens/main/entry/SelectCustomerScreen';
import {getAnalyticsService} from '@/services';
import {applyStyles} from '@/styles';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {getContactService} from '@/services';

export const TransactionEntryScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const {youGave, youGot} = useTransaction();

    const navigation = useAppNavigation();

    const handleYouGave = useCallback(
      ({amount, note, reset}) => {
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
            const closeLoadingModal = openModal('loading', {
              text: 'Adding Transaction...',
            });
            getAnalyticsService()
              .logEvent('selectContent', {
                item_id:
                  '_id' in customer ? customer?._id?.toString() ?? '' : '',
                content_type: 'customer',
              })
              .then(() => {});
            youGave({customer, amount: amount?.value ?? 0, note})
              .then((receipt) => {
                const {customer: nextCustomer} = receipt;
                navigation.navigate('CustomerDetails', {
                  customer: nextCustomer,
                  header: {
                    backButton: false,
                    style: applyStyles({left: 0}),
                  },
                  sendReminder: false,
                  actionButtons: [
                    {
                      onPress: () => {
                        navigation.navigate('EntryTab');
                      },
                      variantColor: 'red',
                      style: applyStyles({width: '50%'}),
                      children: (
                        <Text
                          style={applyStyles(
                            'text-uppercase text-white text-700',
                          )}>
                          Finish
                        </Text>
                      ),
                    },
                  ],
                });
                reset?.();
              })
              .catch(handleError)
              .finally(closeLoadingModal);
          });
      },
      [navigation, openModal, youGave],
    );

    const handleYouCollected = useCallback(
      ({amount, reset, note, showSuccessView, hideSuccessView}) => {
        const closeLoadingModal = openModal('loading', {
          text: 'Adding Transaction...',
        });
        youGot({amount: amount?.value ?? 0, note})
          .then(() => {
            showSuccessView?.();
            setTimeout(() => {
              hideSuccessView?.();
            }, 3000);
            reset?.();
          })
          .catch(handleError)
          .finally(closeLoadingModal);
      },
      [openModal, youGot],
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
