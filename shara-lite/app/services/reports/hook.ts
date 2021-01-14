import {useCallback} from 'react';
import {exportToExcel} from '@/services/file-exports';
import {format} from 'date-fns';
import {numberWithCommas} from '@/helpers/utils';
import {getAuthService, getI18nService} from '@/services';
import {useReceipt} from '@/services/receipt';
import {IReceipt} from '@/models/Receipt';

interface getReceiptsDataInterface {
  receipts?: Realm.Results<IReceipt & Realm.Object>;
}

interface exportReportsToExcelInterface {
  receipts?: Realm.Results<IReceipt & Realm.Object>;
}

const i18Service = getI18nService();

export const useReports = () => {
  const {getReceipts} = useReceipt();
  const currencyCode = getAuthService().getUserCurrencyCode();

  const getReceiptsData = useCallback(
    ({receipts}: getReceiptsDataInterface) => {
      const currentReceipts = receipts || getReceipts();
      const data = [
        [
          i18Service.strings('report.excel_report_headings.date'),
          i18Service.strings('report.excel_report_headings.name'),
          i18Service.strings('report.excel_report_headings.note'),
          `${i18Service.strings(
            'report.excel_report_headings.total_amount',
          )} (${currencyCode})`,
          `${i18Service.strings(
            'report.excel_report_headings.amount_paid',
          )} (${currencyCode})`,
        ],
      ];

      currentReceipts.forEach((receipt: IReceipt) => {
        if (receipt.is_cancelled) {
          return;
        }

        const date = format(
          new Date(receipt?.created_at || ''),
          'dd/MM/yyyy, hh:mm:a',
        );
        const customer = receipt.customer?.name
          ? receipt.customer.name
          : 'No customer';
        const note = receipt?.note ?? '';
        const totalAmount = numberWithCommas(receipt?.total_amount);
        const amountPaid = numberWithCommas(receipt.amount_paid);

        data.push([date, customer, note, totalAmount, amountPaid]);
      });

      const columns = [
        {wch: 20},
        {wch: 20},
        {wch: 10},
        {wch: 20},
        {wch: 20},
        {wch: 20},
      ];

      return {columns, data};
    },
    [getReceipts, currencyCode],
  );

  const getCustomerReceiptsData = useCallback(
    ({receipts}: getReceiptsDataInterface) => {
      const currentReceipts = receipts || getReceipts();
      const data = [
        [
          i18Service.strings('report.excel_report_headings.date'),
          i18Service.strings('report.excel_report_headings.note'),
          `${i18Service.strings(
            'report.excel_report_headings.total_amount',
          )} (${currencyCode})`,
          `${i18Service.strings(
            'report.excel_report_headings.amount_paid',
          )} (${currencyCode})`,
          `${i18Service.strings(
            'report.excel_report_headings.balance',
          )} (${currencyCode})`,
        ],
      ];

      currentReceipts.forEach((receipt: IReceipt) => {
        if (receipt.is_cancelled) {
          return;
        }

        const date = format(
          new Date(receipt?.transaction_date || ''),
          'dd/MM/yyyy, hh:mm:a',
        );
        const note = receipt?.note ?? '';
        const totalAmount = numberWithCommas(receipt?.total_amount);
        const amountPaid = numberWithCommas(receipt.amount_paid);
        const balance = numberWithCommas(receipt?.credit_amount);

        data.push([date, note, totalAmount, amountPaid, balance]);
      });

      const columns = [{wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}];

      return {columns, data};
    },
    [getReceipts, currencyCode],
  );

  const exportReportsToExcel = useCallback(
    async ({receipts}: exportReportsToExcelInterface) => {
      const {data, columns} = getReceiptsData({receipts});
      const date = format(new Date(), 'dd-MM-yyyy hh-mm-a');

      return await exportToExcel({
        data,
        columns,
        filename: `Shara/Reports/Shara Reports - ${date}`,
        notificationTitle: i18Service.strings(
          'report.downloaded_report_notification_title',
        ),
      });
    },
    [getReceiptsData],
  );

  const exportCustomerReportsToExcel = useCallback(
    async ({receipts}: exportReportsToExcelInterface) => {
      const {data, columns} = getCustomerReceiptsData({receipts});
      const date = format(new Date(), 'dd-MM-yyyy hh-mm-a');

      return await exportToExcel({
        data,
        columns,
        filename: `Shara/Reports/Shara Reports - ${date}`,
        notificationTitle: i18Service.strings(
          'report.downloaded_report_notification_title',
        ),
      });
    },
    [getCustomerReceiptsData],
  );

  return {
    exportReportsToExcel,
    exportCustomerReportsToExcel,
  };
};
