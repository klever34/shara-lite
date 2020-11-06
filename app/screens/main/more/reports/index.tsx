import {amountWithCurrency} from '@/helpers/utils';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import React, {useCallback} from 'react';
import {Alert, Text, ToastAndroid, View} from 'react-native';
import {HomeContainer} from '@/components';
import {useReports} from '@/services/reports';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {getAnalyticsService} from '@/services';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {TitleDivider} from '@/components';
import {IReceipt} from '@/models/Receipt';

export const ReportsScreen = () => {
  const realm = useRealm();
  const {exportReportsToExcel} = useReports();
  const financeSummary: IFinanceSummary = getSummary({realm});

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
      />
    </Page>
  );
};
