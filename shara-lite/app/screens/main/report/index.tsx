import {FAButton, SearchFilter, Text} from '@/components';
import EmptyState from '@/components/EmptyState';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService, getAuthService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useReports} from '@/services/reports';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import {Alert, FlatList, SafeAreaView, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {useReceiptList} from '../transactions/hook';
import {ReportListHeader} from './ReportListHeader';
import {ReportListItem} from './ReportListItem';

type Props = ModalWrapperFields;

const i18Service = getI18nService();

export const ReportScreen = withModal(({openModal}: Props) => {
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();
  const {exportUserReportToPDF} = useReports();
  const {showSuccessToast} = useContext(ToastContext);

  const receipts = getTransactions();
  const {
    filter,
    reloadData,
    searchTerm,
    totalAmount,
    filterEndDate,
    filterOptions,
    filterStartDate,
    collectedAmount,
    outstandingAmount,
    filteredReceipts,
    handleStatusFilter,
    handleReceiptSearch,
  } = useReceiptList({receipts});

  useEffect(() => {
    return navigation.addListener('focus', () => {
      reloadData();
    });
  }, [navigation, reloadData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => null,
    });
  }, [navigation]);

  const renderReportListItem = useCallback(
    ({item: transaction}: {item: IReceipt}) => {
      return <ReportListItem transaction={transaction} />;
    },
    [],
  );

  const handleOpenFilterModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <TransactionFilterModal
          onClose={closeModal}
          initialFilter={filter}
          options={filterOptions}
          onDone={handleStatusFilter}
        />
      ),
    });
  }, [filter, filterOptions, openModal, handleStatusFilter]);

  const handleClear = useCallback(() => {
    handleStatusFilter({
      status: 'all',
    });
  }, [handleStatusFilter]);

  const getReportFilterRange = useCallback(() => {
    if (filter === 'all') {
      const startDate =
        filteredReceipts[filteredReceipts.length - 1]?.created_at ?? new Date();
      const endDate = filteredReceipts[0]?.created_at ?? new Date();
      return `${format(startDate, 'dd MMM, yyyy')} - ${format(
        endDate,
        'dd MMM, yyyy',
      )}`;
    }
    if (filter === 'single-day') {
      return format(filterStartDate, 'dd MMM, yyyy');
    }
    return `${format(filterStartDate, 'dd MMM, yyyy')} - ${format(
      filterEndDate,
      'dd MMM, yyyy',
    )}`;
  }, [filterStartDate, filterEndDate, filter, filteredReceipts]);

  const handleDownloadReport = useCallback(async () => {
    const closeModal = openModal('loading', {text: 'Generating report...'});
    try {
      const pdfFilePath = await exportUserReportToPDF({
        totalAmount,
        collectedAmount,
        outstandingAmount,
        filterRange: getReportFilterRange(),
        businessName: getAuthService().getBusinessInfo().name,
        data: filteredReceipts.sorted('created_at', false),
      });
      closeModal();
      await FileViewer.open(pdfFilePath, {showOpenWithDialog: true});
      getAnalyticsService()
        .logEvent('userDownloadedReport', {})
        .then(() => {})
        .catch(handleError);
      showSuccessToast('REPORT DOWNLOADED');
    } catch (error) {
      closeModal();
      Alert.alert('Error', error.message);
    }
  }, [
    openModal,
    filteredReceipts,
    showSuccessToast,
    exportUserReportToPDF,
    totalAmount,
    collectedAmount,
    outstandingAmount,
    getReportFilterRange,
  ]);

  const getFilterLabelText = useCallback(() => {
    const activeOption = filterOptions?.find((item) => item.value === filter);
    if (filter === 'date-range' && filterStartDate && filterEndDate) {
      return (
        <Text>
          <Text style={applyStyles('text-gray-300 text-400')}>From</Text>{' '}
          <Text style={applyStyles('text-green-100 text-400')}>
            {format(filterStartDate, 'dd MMM, yyyy')}
          </Text>{' '}
          <Text style={applyStyles('text-gray-300 text-400')}>to</Text>{' '}
          <Text style={applyStyles('text-green-100 text-400')}>
            {format(filterEndDate, 'dd MMM, yyyy')}
          </Text>
        </Text>
      );
    }
    return (
      <Text style={applyStyles('text-green-100 text-400 text-capitalize')}>
        {activeOption?.text}
      </Text>
    );
  }, [filter, filterEndDate, filterOptions, filterStartDate]);

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <View
        style={applyStyles('flex-row py-8 pr-16 bg-white items-center', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <HeaderBackButton iconName="arrow-left" labelVisible={false} />
        <Text style={applyStyles('text-400 text-black text-lg')}>
          {i18Service.strings('report.title')}
        </Text>
      </View>
      <View
        style={applyStyles('pr-8 flex-row items-center justify-between', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <SearchFilter
          value={searchTerm}
          onSearch={handleReceiptSearch}
          placeholderText={i18Service.strings(
            'report.search_input_placeholder',
          )}
          containerStyle={applyStyles('flex-1')}
          onClearInput={() => handleReceiptSearch('')}
        />
        {!searchTerm && (
          <Touchable onPress={handleOpenFilterModal}>
            <View
              style={applyStyles('py-4 px-8 flex-row items-center', {
                borderWidth: 1,
                borderRadius: 4,
                borderColor: colors['gray-20'],
              })}>
              <Text style={applyStyles('text-gray-200 text-700 pr-8')}>
                {i18Service.strings('report.filter_button_text')}
              </Text>
              <Icon
                size={16}
                name="calendar"
                type="feathericons"
                color={colors['gray-50']}
              />
            </View>
          </Touchable>
        )}
      </View>
      {filter && filter !== 'all' && (
        <View
          style={applyStyles(
            'py-8 px-16 flex-row items-center justify-between',
            {
              borderBottomWidth: 1.5,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View style={applyStyles('flex-row items-center flex-1')}>
            <Text style={applyStyles('text-gray-50 text-700 text-uppercase')}>
              {i18Service.strings('report.active_filter_label_text')}:{' '}
            </Text>
            <View style={applyStyles('flex-1')}>{getFilterLabelText()}</View>
          </View>
          <Touchable onPress={handleClear}>
            <View
              style={applyStyles('py-4 px-8 flex-row items-center bg-gray-20', {
                borderWidth: 1,
                borderRadius: 24,
                borderColor: colors['gray-20'],
              })}>
              <Text
                style={applyStyles(
                  'text-xs text-gray-200 text-700 text-uppercase pr-8',
                )}>
                {i18Service.strings('report.clear_filter_button_text')}
              </Text>
              <Icon
                name="x"
                size={16}
                type="feathericons"
                color={colors['gray-50']}
              />
            </View>
          </Touchable>
        </View>
      )}
      <View
        style={applyStyles(
          'py-12 px-16 flex-row items-center justify-between',
          {
            borderBottomWidth: 1.5,
            borderBottomColor: colors['gray-20'],
          },
        )}>
        <Text style={applyStyles('text-black text-700 text-uppercase')}>
          {i18Service.strings('report.net_balance_text')}
        </Text>
        <Text
          style={applyStyles(
            `text-gray-50 text-700 text-uppercase ${
              outstandingAmount > 0 ? 'text-green-200' : 'text-red-200'
            }`,
          )}>
          {amountWithCurrency(outstandingAmount)}
        </Text>
      </View>

      {!!filteredReceipts && filteredReceipts.length ? (
        <>
          {!!searchTerm && (
            <View style={applyStyles('px-16 py-12 flex-row bg-gray-10')}>
              <Text style={applyStyles('text-base text-gray-300')}>
                {`${filteredReceipts.length} ${
                  filteredReceipts.length > 1
                    ? i18Service.strings('report.results.other')
                    : i18Service.strings('report.results.one')
                }`}
              </Text>
            </View>
          )}
          <ReportListHeader
            totalAmount={totalAmount}
            amountPaid={collectedAmount}
            totalEntries={filteredReceipts.length}
          />
          <FlatList
            data={filteredReceipts}
            initialNumToRender={10}
            style={applyStyles('bg-white')}
            renderItem={renderReportListItem}
            keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          />
        </>
      ) : (
        <EmptyState
          style={applyStyles('bg-white')}
          source={require('@/assets/images/emblem.png')}
          imageStyle={applyStyles('pb-32', {width: 80, height: 80})}>
          <View style={applyStyles('center')}>
            <Text style={applyStyles('text-black text-xl pb-4')}>
              {searchTerm || filter
                ? i18Service.strings('report.empty_state_text.no_results_found')
                : i18Service.strings('report.empty_state_text.no_records_yet')}
            </Text>
          </View>
        </EmptyState>
      )}
      <FAButton
        style={applyStyles(
          'w-auto rounded-16 py-16 px-20 flex-row items-center',
        )}
        onPress={handleDownloadReport}>
        <Text style={applyStyles('text-700 text-uppercase text-sm text-white')}>
          {i18Service.strings('report.download_report_button_text')}
        </Text>
      </FAButton>
    </SafeAreaView>
  );
});
