import {amountWithCurrency} from '@/helpers/utils';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import React, {useCallback} from 'react';
import {Alert, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {ActionCard} from '@/components';
import {useReports} from '@/services/reports';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {getAnalyticsService} from '@/services';
import Touchable from '@/components/Touchable';
import {Icon} from '@/components/Icon';
import {TitleDivider} from '@/components';

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
      <View style={styles.container}>
        <View style={applyStyles('mb-lg')}>
          <ActionCard
            style={applyStyles(styles.card, {backgroundColor: colors.primary})}>
            <Text
              style={applyStyles(styles.cardTitle, {color: colors['red-50']})}>
              My sales
            </Text>
            <Text
              style={applyStyles(styles.cardContent, {color: colors.white})}>
              {amountWithCurrency(financeSummary.totalSales)}
            </Text>
          </ActionCard>
        </View>
        <View style={applyStyles('flex-row', 'mb-lg', 'justify-between')}>
          <ActionCard
            style={applyStyles(styles.card, {
              backgroundColor: colors.white,
              width: '48%',
            })}>
            <Text
              style={applyStyles(styles.cardTitle, {
                color: colors['gray-100'],
              })}>
              Total credit
            </Text>
            <Text
              style={applyStyles(styles.cardContent, {
                color: colors['gray-300'],
              })}>
              {amountWithCurrency(financeSummary.totalCredit)}
            </Text>
          </ActionCard>
          <ActionCard
            style={applyStyles(styles.card, {
              backgroundColor: colors.white,
              width: '48%',
            })}>
            <Text
              style={applyStyles(styles.cardTitle, {
                color: colors['gray-100'],
              })}>
              Overdue credit
            </Text>
            <Text
              style={applyStyles(styles.cardContent, {color: colors.primary})}>
              {amountWithCurrency(financeSummary.overdueCredit)}
            </Text>
          </ActionCard>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemIcon: {
    height: 45,
    width: 45,
  },
  listItemText: {
    fontSize: 16,
    paddingRight: 12,
    color: colors['gray-300'],
  },
  card: {
    padding: 16,
    paddingTop: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    paddingBottom: 4,
    fontFamily: 'Rubik-Medium',
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
});
