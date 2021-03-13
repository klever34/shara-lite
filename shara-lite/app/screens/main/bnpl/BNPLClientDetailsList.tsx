import {Button, toNumber} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {getApiService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {useCallback, useState} from 'react';
import {FlatList, InteractionManager, Text, View} from 'react-native';
import {AddRepaymentModal} from './AddRepaymentModal';
import {BNPLClientTransactionListItem} from './BNPLClientTransactionListItem';

type Props = {
  customer?: ICustomer;
  drawdown: IBNPLDrawdown;
  data: Realm.Results<IBNPLRepayment>;
  header: {caption: string; amount: number};
} & ModalWrapperFields;

const strings = getI18nService().strings;

export const BNPLClientDetailsList = withModal((props: Props) => {
  const {data, header, drawdown, customer, openModal} = props;
  const navigation = useAppNavigation();
  const {getReceipt} = useReceipt();

  const renderListItem = useCallback(
    ({item}) => <BNPLClientTransactionListItem item={item} />,
    [],
  );

  const handleDone = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('BNPLScreen');
    });
  }, [navigation]);

  const handleSaveRepayment = useCallback(
    async (values) => {
      try {
        let receipt;
        const {data} = await getApiService().saveBNPLRepayment({
          amount: toNumber(values.amount),
          drawdown_id: drawdown?.api_id,
        });
        const {approval, repayments, drawdown: drawdownData} = data;
        if (drawdown && drawdown.receipt?._id) {
          receipt = drawdown && getReceipt({receiptId: drawdown.receipt?._id});
        }

        navigation.navigate('BNPLTransactionSuccessScreen', {
          amount: toNumber(values.amount),
          transaction: {
            approval,
            repayments,
            receiptData: receipt,
            drawdown: drawdownData,
          },
          onDone: handleDone,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleDone, navigation],
  );

  const handleAddRepayment = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <AddRepaymentModal
          onClose={closeModal}
          onSubmit={handleSaveRepayment}
          initialValues={{
            amount: drawdown.payment_frequency_amount?.toString() ?? '',
          }}
        />
      ),
    });
  }, [handleSaveRepayment, openModal]);

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      {!!header.amount && (
        <View style={applyStyles('bg-gray-10 py-16 px-24')}>
          <View style={applyStyles('flex-row items-center justify-between')}>
            <Text style={applyStyles('text-gray-300')}>{header.caption}</Text>
            <Text style={applyStyles('text-gray-300 text-700')}>
              {amountWithCurrency(header.amount)}
            </Text>
          </View>
        </View>
      )}
      <FlatList
        data={data}
        initialNumToRender={10}
        renderItem={renderListItem}
        keyExtractor={(item) => `${item._id?.toString()}`}
        ListEmptyComponent={
          <EmptyState
            text={strings('bnpl.client.empty_state', {client: customer?.name})}
          />
        }
        contentContainerStyle={
          !data.length
            ? applyStyles('flex-1')
            : applyStyles({paddingBottom: 180})
        }
      />
      <Button
        onPress={handleAddRepayment}
        style={applyStyles('absolute bottom-16 rounded-32', {
          left: (dimensions.fullWidth - 200) / 2,
          width: 200,
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Icon
            size={18}
            name="plus"
            color={colors.white}
            type="material-community-icons"
          />
          <Text style={applyStyles('pl-8 text-uppercase text-white')}>
            {strings('bnpl.add_repayment')}
          </Text>
        </View>
      </Button>
    </View>
  );
});
