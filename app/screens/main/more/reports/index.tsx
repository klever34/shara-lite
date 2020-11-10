import {amountWithCurrency} from '@/helpers/utils';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import React, {useCallback} from 'react';
import {
  Alert,
  ListRenderItemInfo,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {HomeContainer} from '@/components';
import {useReports} from '@/services/reports';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {getAnalyticsService} from '@/services';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {TitleDivider} from '@/components';
import {IReceipt} from '@/models/Receipt';
import {useReceiptList} from '@/screens/main/receipts/ReceiptListScreen';
import {format} from 'date-fns';
import {useAppNavigation} from '@/services/navigation';

export const ReportsScreen = () => {
  const realm = useRealm();
  const {exportReportsToExcel} = useReports();
  const financeSummary: IFinanceSummary = getSummary({realm});

  const {
    filter,
    filterOptionLabels,
    filteredReceipts,
    filterOptions,
    handleReceiptSearch,
  } = useReceiptList({initialFilter: 'all'});

  const handleExport = useCallback(async () => {
    try {
      await exportReportsToExcel();
      ToastAndroid.show('Report exported successfully', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [exportReportsToExcel]);

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
                  receipt.credit_amount === 0
                    ? 'text-gray-100'
                    : 'text-red-100',
                )}>
                {receipt.credit_amount === 0 ? 'Owes you' : 'Paid'}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleReceiptItemSelect],
  );

  return (
    <Page
      style={applyStyles('px-0')}
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
        headerAmount={amountWithCurrency(financeSummary.totalSales)}
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
      />
    </Page>
  );
};
