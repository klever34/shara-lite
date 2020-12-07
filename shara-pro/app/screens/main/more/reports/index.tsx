import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useContext, useMemo} from 'react';
import {Alert, ListRenderItemInfo, Text, View} from 'react-native';
import {HomeContainer, TitleDivider} from '@/components';
import {useReports} from '@/services/reports';
import {Page} from '@/components/Page';
import {getAnalyticsService} from '@/services';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {IReceipt} from '@/models/Receipt';
import {useReceiptList} from '@/screens/main/receipts/ReceiptListScreen';
import {format} from 'date-fns';
import {useAppNavigation} from '@/services/navigation';
import {ToastContext} from '@/components/Toast';

export const ReportsScreen = () => {
  const {exportReportsToExcel} = useReports();

  const {
    filter,
    filterOptionLabels,
    filteredReceipts,
    filterOptions,
    handleReceiptSearch,
    totalAmount,
  } = useReceiptList({initialFilter: 'all'});
  const {showSuccessToast} = useContext(ToastContext);
  const handleExport = useCallback(async () => {
    try {
      await exportReportsToExcel({receipts: filteredReceipts});
      showSuccessToast('Report exported successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [filteredReceipts, exportReportsToExcel, showSuccessToast]);

  const analyticsService = getAnalyticsService();

  // const shareProps: ShareHookProps = {
  //   image: receiptImage,
  //   recipient: receipt?.customer?.mobile,
  //   title: isFulfilled || isNew ? 'Share Receipt' : 'Payment Reminder',
  //   subject: isFulfilled || isNew ? 'Share Receipt' : 'Payment Reminder',
  //   message:
  //     isFulfilled || isNew ? receiptShareMessage : paymentReminderMessage,
  // };
  //
  // const {handleEmailShare, handleWhatsappShare} = useShare(shareProps);

  const onEmailShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'email',
        content_type: 'report-export',
        item_id: '',
      })
      .then(() => {});
    // handleEmailShare();
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
  }, [analyticsService]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'report-export',
        item_id: '',
      })
      .then(() => {});
    // handleWhatsappShare();
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
  }, [analyticsService]);

  const navigation = useAppNavigation();

  const handleReceiptItemSelect = useCallback(
    (receipt: IReceipt) => {
      navigation.navigate('ReceiptDetails', {id: receipt._id});
    },
    [navigation],
  );

  const renderReceiptItem = useCallback(
    ({item: receipt, index}: ListRenderItemInfo<IReceipt>) => {
      return (
        <Touchable onPress={() => handleReceiptItemSelect(receipt)}>
          <View
            style={applyStyles(
              'flex-row py-8 px-16',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-10',
            )}>
            <View style={applyStyles('flex-1')}>
              <Text
                numberOfLines={1}
                style={applyStyles(
                  'text-700 font-bold text-xs text-uppercase text-gray-300',
                )}>
                {receipt.customer?.name ?? 'No Customer'}
              </Text>
              {receipt?.created_at && (
                <Text
                  numberOfLines={1}
                  style={applyStyles(
                    'text-400 text-xxs text-uppercase text-gray-100',
                  )}>
                  {format(receipt?.created_at, 'MMM dd yyyy, hh:mmaa')}
                </Text>
              )}
            </View>
            <View style={applyStyles('flex-1')}>
              <Text
                style={applyStyles(
                  'text-700 font-bold text-xs text-uppercase text-gray-300 text-center',
                )}>
                {amountWithCurrency(receipt.total_amount)}
              </Text>
            </View>
            <View style={applyStyles('flex-1')}>
              <Text
                style={applyStyles(
                  'text-700 font-bold text-xs text-uppercase text-right',
                  receipt.credit_amount ? 'text-red-100' : 'text-gray-100',
                )}>
                {receipt.credit_amount ? 'Owes you' : 'Paid'}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleReceiptItemSelect],
  );

  const totalCreditAmount = useMemo(
    () =>
      filteredReceipts.reduce((acc, receipt) => acc + receipt.credit_amount, 0),
    [filteredReceipts],
  );

  const moreHeader = (
    <View style={applyStyles('flex-row py-16 px-16 bg-white')}>
      <View style={applyStyles('flex-1')}>
        <Text
          numberOfLines={1}
          style={applyStyles('text-400 text-xs text-uppercase text-gray-200')}>
          {"You've received"}
        </Text>
        <Text
          numberOfLines={1}
          style={applyStyles(
            'text-700 font-bold text-sm text-uppercase text-gray-300',
          )}>
          {amountWithCurrency(totalAmount - totalCreditAmount)}
        </Text>
      </View>
      <View style={applyStyles('flex-1')}>
        <Text
          style={applyStyles(
            'text-400 text-xs text-uppercase text-gray-200 self-end',
          )}>
          {"You're owed"}
        </Text>
        <Text
          numberOfLines={1}
          style={applyStyles(
            'text-700 font-bold text-sm text-uppercase text-red-100 self-end',
          )}>
          {amountWithCurrency(totalCreditAmount)}
        </Text>
      </View>
    </View>
  );

  return (
    <Page
      style={applyStyles('px-0 pt-0')}
      header={{title: 'Report', iconLeft: {}}}
      footer={
        <View
          style={applyStyles(
            'flex-row w-full items-center justify-space-between flex-wrap',
          )}>
          <TitleDivider title="Share Report" showLine={false} />
          <View style={applyStyles('center', {width: '33%'})}>
            <Touchable onPress={onWhatsappShare}>
              <View
                style={applyStyles('w-full', 'flex-row', 'center', {
                  height: 48,
                })}>
                <Icon
                  size={24}
                  type="ionicons"
                  name="logo-whatsapp"
                  color={colors.whatsapp}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  whatsapp
                </Text>
              </View>
            </Touchable>
          </View>
          <View style={applyStyles('center', {width: '33%'})}>
            <Touchable onPress={onEmailShare}>
              <View
                style={applyStyles('w-full', 'flex-row', 'center', {
                  height: 48,
                })}>
                <Icon
                  size={24}
                  name="mail"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  email
                </Text>
              </View>
            </Touchable>
          </View>
          <View style={applyStyles('center', {width: '33%'})}>
            <Touchable onPress={handleExport}>
              <View
                style={applyStyles('w-full', 'flex-row', 'center', {
                  height: 48,
                })}>
                <Icon
                  size={24}
                  name="download-cloud"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  download
                </Text>
              </View>
            </Touchable>
          </View>
        </View>
      }>
      <HomeContainer<IReceipt>
        initialNumToRender={10}
        headerTitle="total sales"
        headerAmount={amountWithCurrency(totalAmount)}
        searchPlaceholderText="Search"
        emptyStateProps={{
          heading: 'Nothing to show',
          text: 'No result found.',
          source: undefined,
        }}
        data={filteredReceipts}
        onSearch={handleReceiptSearch}
        filterOptions={filterOptions}
        activeFilter={filterOptionLabels[filter]}
        renderListItem={renderReceiptItem}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        showFAB={false}
        moreHeader={moreHeader}
        headerStyle={applyStyles('bg-gray-10 px-8')}
      />
    </Page>
  );
};
