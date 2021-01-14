import {useCallback} from 'react';
import {exportToExcel, exportHTMLToPDF} from '@/services/file-exports';
import {format} from 'date-fns';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {getAuthService, getI18nService} from '@/services';
import {useReceipt} from '@/services/receipt';
import {IReceipt} from '@/models/Receipt';

interface getReceiptsDataInterface {
  receipts?: Realm.Results<IReceipt & Realm.Object>;
}

interface exportReportsToExcelInterface {
  receipts?: Realm.Results<IReceipt & Realm.Object>;
}

interface ReportToHTMLInterface {
  filterRange?: string;
  businessName: string;
  totalAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
  data: Realm.Results<IReceipt & Realm.Object>;
}

const i18Service = getI18nService();

const ITEMS_PER_PAGE = 30;
const NO_OF_ITEMS_ON_PAGE_ONE = 10;

export const getNumberOfPages = ({noOfItems}: {noOfItems: number}) => {
  const total = noOfItems;
  const difference = total - NO_OF_ITEMS_ON_PAGE_ONE;
  const restOfPages = difference < 0 ? 0 : difference;

  return 1 + Math.ceil(restOfPages / ITEMS_PER_PAGE);
};

const reportPageHeaderHTML = ({businessName}: {businessName: string}) => `
  <div style="display: flex;align-items: center;justify-content: space-between;height: 50px;padding: 0 12px; background-color: #DD0404;">
    <h1 style="font-size: 24px;color: white; text-transform: uppercase">${businessName}</h1>
    <h1 style="font-size: 24px;color: white; text-transform: uppercase">Shara</h1>
  </div>
`;

const reportPageFooterHTML = () => `
  <div style="width: calc(100% - 24px);bottom: 0;position:absolute;display: flex;align-items: center;justify-content: space-between;height: 50px;padding: 0 12px; background-color: #DD0404;">
    <h1 style="font-size: 24px;color: white; text-transform: uppercase">Shara</h1>
    <p style="color: white;">Start using Shara Today, Download from the Playstore</p>
  </div>
`;

const reportHeaderHTML = ({filterRange}: {filterRange?: string}) => `
  <div style="display:flex;align-items: center;justify-content: center;flex-direction: column;padding-bottom: 54px;">
    <h2 style="margin:0;padding-bottom: 4px;font-weight: 700;">Account Statement</h2>
    ${filterRange ? `<p style="margin:0;">(${filterRange})</p>` : ''}
  </div>
`;

const reportSummaryHTML = ({
  totalEntries,
  collectedAmount,
  outstandingAmount,
  totalAmount,
}: {
  totalAmount: number;
  totalEntries: number;
  collectedAmount: number;
  outstandingAmount: number;
}) => `
  <div style="padding: 20px 16px;display: flex;align-items: center;border:1px solid #ECECEC;border-radius: 8px;margin-bottom: 32px;">
    <div style="width: 33%;padding-right: 16px;">
      <p style="margin:0;padding-bottom: 8px;">Total Collected</p>
      <p style="margin:0;font-weight: 500;">${amountWithCurrency(
        collectedAmount,
      )}</p>
    </div>
    <div style="width: 33%;padding-right: 16px;">
      <p style="margin:0;padding-bottom: 8px;">Total Outstanding</p>
      <p style="margin:0;color: #DD0404;font-weight: 500;">${amountWithCurrency(
        outstandingAmount,
      )}</p>
    </div>
    <div style="width: 33%;padding-right: 16px;">
      <p style="margin:0;padding-bottom: 8px;">Total Amount</p>
      <p style="margin:0;font-weight: 500;">${amountWithCurrency(
        totalAmount,
      )}</p>
    </div>
  </div>
  <div style="margin-bottom: 32px;">
    <p>No. of Entries: ${totalEntries}</p>
  </div>
`;

const userReportTableHTML = ({data}: {data: IReceipt[]}) => `
  <div style="height: 30px;padding: 8px;display: flex;background: #F5F5F5;align-items: center;margin-bottom: 8px;">
    <p style="width: 15%;padding-right: 8px;font-weight: 700;">Date</p>
    <p style="width: 25%;padding-right: 8px;font-weight: 700;">Name</p>
    <p style="width: 20%;padding-right: 8px;font-weight: 700;">Note</p>
    <p style="width: 20%;padding-right: 8px;text-align: center;font-weight: 700;">Total Amount</p>
    <p style="width: 20%;text-align: center;font-weight: 700;">Amount Paid</p>
  </div>
  ${data
    .map(
      (item) => `
      <div style="display: flex;border: 1px solid #ECECEC;align-items: center;">
        <p style="margin:0;width: 15%;padding: 12px;">${format(
          item.transaction_date ?? new Date(),
          'dd MMM',
        )}</p>
        <p style="margin:0;width: 25%;padding: 12px 12px 12px 0;">${
          item?.customer?.name ?? ''
        }</p>
        <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;">${
          item.note ?? ''
        }</p>
        <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;text-align: center;border-left: 1px solid #ECECEC;border-right: 1px solid #ECECEC;">
          ${!item.is_collection ? amountWithCurrency(item.total_amount) : ''}
        </p>
        <p style="margin:0;width: 20%;padding: 12px 0;text-align: center;">
          ${item.amount_paid ? amountWithCurrency(item.amount_paid) : ''}
        </p>
      </div>
    `,
    )
    .join('')}
`;

const generateUserReportHTML = (options: ReportToHTMLInterface) => {
  let htmlString = [] as string[];
  const {
    data,
    filterRange,
    businessName,
    collectedAmount,
    outstandingAmount,
    totalAmount,
  } = options;

  const totalEntries = data.length;
  const noOfPages = getNumberOfPages({noOfItems: totalEntries});
  const itemsOnPageOne = data.filter(
    (_, index) => index < NO_OF_ITEMS_ON_PAGE_ONE,
  );
  const itemsOtherPages = data.filter(
    (_, index) => index > NO_OF_ITEMS_ON_PAGE_ONE,
  );

  for (let i = 0; i < noOfPages; i++) {
    if (i === 0) {
      htmlString.push(`
        <html style="padding: 0;margin: 0;box-sizing: border-box;">
          <body style="padding: 0;margin: 0;box-sizing: border-box;position: absolute;width: 100%;height: 100%;">
            ${reportPageHeaderHTML({businessName})}
            <div style="padding: 12px 32px;height: calc(100% - 124px);background-color: white;">
              ${reportHeaderHTML({filterRange})}
              ${reportSummaryHTML({
                totalEntries,
                collectedAmount,
                outstandingAmount,
                totalAmount,
              })}
              ${userReportTableHTML({data: itemsOnPageOne})}
            </div>
            ${reportPageFooterHTML()}
          </body>
        </html>
      `);
    } else {
      htmlString.push(`
        <html style="padding: 0;margin: 0;box-sizing: border-box;">
          <body style="padding: 0;margin: 0;box-sizing: border-box;position: absolute;width: 100%;height: 100%;">
            ${reportPageHeaderHTML({businessName})}
            <div style="padding: 12px 32px;height: calc(100% - 124px);background-color: white;">
              ${userReportTableHTML({data: itemsOtherPages})}
            </div>
            ${reportPageFooterHTML()}
          </body>
        </html>
      `);
    }
  }

  return htmlString.join('');
};

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

  const exportUserReportToPDF = useCallback(
    async (options: ReportToHTMLInterface) => {
      const html = generateUserReportHTML(options);
      const date = format(new Date(), 'dd-MM-yyyy hh-mm-a');
      await exportHTMLToPDF({
        html,
        fileName: `Shara/Reports/Shara Reports - ${date}.pdf`,
      });
    },
    [],
  );

  return {
    exportReportsToExcel,
    exportUserReportToPDF,
    exportCustomerReportsToExcel,
  };
};
