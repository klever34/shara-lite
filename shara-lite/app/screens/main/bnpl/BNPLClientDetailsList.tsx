import {Button} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {useCallback} from 'react';
import {FlatList, InteractionManager, Text, View} from 'react-native';
import {AddRepaymentModal} from './AddRepaymentModal';
import {BNPLClientTransactionListItem} from './BNPLClientTransactionListItem';

type Props = {
  data: any[];
  header: {caption: string; amount: number};
} & ModalWrapperFields;

const strings = getI18nService().strings;

export const BNPLClientDetailsList = withModal((props: Props) => {
  const {data, header, openModal, closeModal} = props;
  const navigation = useAppNavigation();

  const handlePressListItem = useCallback(
    (item: any) => {
      navigation.navigate('BNPLTransactionDetailsScreen', {transaction: item});
    },
    [navigation],
  );

  const renderListItem = useCallback(
    ({item}) => (
      <BNPLClientTransactionListItem
        item={item}
        onPress={() => handlePressListItem(item)}
      />
    ),
    [handlePressListItem],
  );

  const handleDone = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('BNPLScreen');
    });
  }, [navigation]);

  const handleSaveRepayment = useCallback(
    (values) => {
      navigation.navigate('BNPLRepaymentSuccessScreen', {
        transaction: values,
        onDone: handleDone,
      });
    },
    [handleDone, navigation],
  );

  const handleAddRepayment = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <AddRepaymentModal
          onClose={closeModal}
          onSubmit={handleSaveRepayment}
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
            <Text style={applyStyles('text-gray-300')}>
              {amountWithCurrency(header.amount)}
            </Text>
          </View>
        </View>
      )}
      <View>
        <View style={applyStyles('bg-gray-10 py-16 px-24')}>
          <View
            style={applyStyles('pb-8 flex-row items-center justify-between')}>
            <Text style={applyStyles('text-gray-300')}>
              {strings('bnpl.payment_left_text.one', {
                amount: 5,
              })}
            </Text>
            <Text style={applyStyles('text-gray-300')}>
              {amountWithCurrency(0)}
            </Text>
          </View>
        </View>
        <FlatList
          data={data}
          initialNumToRender={10}
          renderItem={renderListItem}
          keyExtractor={(item) => `${item._id.toString()}`}
          ListEmptyComponent={<EmptyState text={strings('bnpl.empty_state')} />}
          contentContainerStyle={
            !data.length
              ? applyStyles('flex-1')
              : applyStyles({paddingBottom: 180})
          }
        />
      </View>
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
