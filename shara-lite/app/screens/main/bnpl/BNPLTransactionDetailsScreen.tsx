import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {useCallback} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {getI18nService} from '@/services';
import {format} from 'date-fns';
import Icon from '@/components/Icon';
import {Button} from '@/components';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {ShareModal} from './ShareModal';

const strings = getI18nService().strings;

type Props = {} & ModalWrapperFields;

export const BNPLTransactionDetailsScreen = withModal((props: Props) => {
  const {openModal} = props;

  const handleShareModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => <ShareModal />,
    });
  }, [openModal]);

  return (
    <SafeAreaView style={applyStyles('bg-white flex-1')}>
      <View style={applyStyles('px-24 pb-16')}>
        <Text
          style={applyStyles('py-24 text-gray-100 text-center text-uppercase')}>
          {strings('bnpl.transaction_info.date', {
            date: format(new Date(), 'dd MMMM, yyyy'),
          })}
        </Text>
        <View style={applyStyles('flex-row px-24 justify-around')}>
          <Text style={applyStyles('py-18 text-gray-100')}>
            {strings('bnpl.transaction_info.total_amount_text')}
          </Text>
          <Text style={applyStyles('py-18 text-gray-100')}>
            {strings('bnpl.transaction_info.total_amount', {
              amount: amountWithCurrency(1000),
            })}
          </Text>
        </View>
        <View style={applyStyles('flex-row px-24 justify-around')}>
          <Text style={applyStyles('py-18 text-gray-100 text-right')}>
            {strings('bnpl.transaction_info.paid_text')}
          </Text>
          <Text style={applyStyles('py-18 text-gray-100 text-right')}>
            {strings('bnpl.transaction_info.paid_amount', {
              amount: amountWithCurrency(1000),
            })}
          </Text>
        </View>
        <View
          style={applyStyles('flex-row px-24 justify-around border-t-1', {
            borderColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('py-18 text-gray-100')}>
            {strings('bnpl.transaction_info.outstanding_text')}
          </Text>
          <Text style={applyStyles('py-18 text-gray-100')}>
            {strings('bnpl.transaction_info.outstanding_amount', {
              amount: amountWithCurrency(1000),
            })}
          </Text>
        </View>

        <Text
          style={applyStyles(
            'py-24 text-gray-100 text-center text-uppercase text-sm',
          )}>
          {strings('bnpl.record_transaction.bnpl_terms_text')}
        </Text>

        <View
          style={applyStyles(
            'p-16 flex-row items-center justify-around border-t-1 border-b-1',
            {
              borderColor: colors['gray-20'],
            },
          )}>
          <View style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('pb-8 text-gray-300 text-2xl')}>
              {amountWithCurrency(0)}
            </Text>
            <Text style={applyStyles('text-gray-100')}>
              {strings('bnpl.repayment_per_week', {
                amount: amountWithCurrency(0),
              })}
            </Text>
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('pb-8 text-right text-gray-300 text-2xl')}>
              {strings('bnpl.day_text.other', {
                amount: 56,
              })}
            </Text>
            <Text style={applyStyles('text-right text-gray-100')}>
              {strings('bnpl.payment_left_text.other', {
                amount: 8,
              })}
            </Text>
          </View>
        </View>
        <Text
          style={applyStyles(
            'pt-24 pb-8 text-red-100 text-center text-uppercase',
          )}>
          {strings('bnpl.record_transaction.repayment_date', {
            date: format(new Date(), 'dd MMM, yyyy'),
          })}
        </Text>

        <View style={applyStyles('py-24')}>
          <Text
            style={applyStyles(
              'pb-10 text-gray-100 text-left text-uppercase text-sm',
            )}>
            {strings('bnpl.transaction_info.notes')}
          </Text>
          <Text style={applyStyles('text-gray-200 text-left text-base')}>
            {strings('bnpl.transaction_info.notes_text_content', {
              notes:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
            })}
          </Text>
        </View>
      </View>
      <Button
        onPress={handleShareModal}
        style={applyStyles('absolute bottom-16 rounded-32', {
          left: (dimensions.fullWidth - 200) / 2,
          width: 200,
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Icon
            size={18}
            name="send"
            color={colors.white}
            type="material-community-icons"
          />
          <Text style={applyStyles('pl-8 text-uppercase text-white')}>
            {strings('bnpl.share_receipt')}
          </Text>
        </View>
      </Button>
    </SafeAreaView>
  );
});
