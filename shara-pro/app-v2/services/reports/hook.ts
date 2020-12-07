import {useCallback} from 'react';
import {exportToExcel} from 'app-v2/services/file-exports';
import {useRealm} from 'app-v2/services/realm';
import {getAllPayments, getReceipts} from 'app-v2/services/ReceiptService';
import {format} from 'date-fns';
import {numberWithCommas} from 'app-v2/helpers/utils';
import {getAuthService} from 'app-v2/services';

export const useReports = () => {
  const realm = useRealm();
  const currencyCode = getAuthService().getUserCurrencyCode();

  const getReceiptsData = useCallback(() => {
    const receipts = getReceipts({realm});
    const data = [
      [
        'Date',
        'Customer',
        'Products',
        `Total Amount (${currencyCode})`,
        `Amount Paid (${currencyCode})`,
        `Credit (${currencyCode})`,
      ],
    ];

    receipts.forEach((receipt) => {
      if (receipt.is_cancelled) {
        return;
      }
      const allPayments = getAllPayments({receipt});
      const totalAmountPaid = allPayments.reduce(
        (total, payment) => total + payment.amount_paid,
        0,
      );

      const date = format(
        new Date(receipt?.created_at || ''),
        'dd/MM/yyyy, hh:mm:a',
      );
      const customer = receipt.customer?.name
        ? receipt.customer.name
        : 'No customer';
      const items = receipt.items?.length || 0;
      const totalAmount = numberWithCommas(receipt?.total_amount);
      const amountPaid = numberWithCommas(totalAmountPaid);
      const credit = numberWithCommas(receipt?.total_amount - totalAmountPaid);

      data.push([
        date,
        customer,
        items.toString(),
        totalAmount,
        amountPaid,
        credit,
      ]);
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
  }, [currencyCode, realm]);

  const exportReportsToExcel = useCallback(async () => {
    const {data, columns} = getReceiptsData();
    const date = format(new Date(), 'dd-MM-yyyy hh-mm-a');

    await exportToExcel({
      data,
      columns,
      filename: `Shara Receipts - ${date}`,
      notificationTitle: 'Report exported successfully',
    });
  }, [getReceiptsData]);

  return {
    exportReportsToExcel,
  };
};
