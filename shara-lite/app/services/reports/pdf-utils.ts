import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {format} from 'date-fns';

export interface ReportToHTMLInterface {
  filterRange?: string;
  businessName: string;
  totalAmount: number;
  customer?: ICustomer;
  collectedAmount: number;
  outstandingAmount: number;
  data: Realm.Results<IReceipt & Realm.Object>;
}

const ITEMS_PER_PAGE = 16;
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
  <div style="width: calc(100% - 24px);display: flex;align-items: center;justify-content: space-between;height: 50px;padding: 0 12px; background-color: #DD0404;">
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
  <div style="height: 30px;display: flex;background: #F5F5F5;align-items: center;margin-bottom: 8px;">
    <p style="margin:0;width: 15%;padding: 12px;font-weight: 700;font-size:12px;">Date</p>
    <p style="margin:0;width: 25%;padding: 12px 12px 12px 0;font-weight: 700;font-size:12px;">Name</p>
    <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;font-weight: 700;font-size:12px;">Note</p>
    <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;text-align: center;font-weight: 700;font-size:12px;">Total Amount</p>
    <p style="margin:0;width: 20%;text-align: center;font-weight: 700;font-size:12px;padding: 12px 0;">Amount Paid</p>
  </div>
  ${data
    .map(
      (item) => `
      <div style="display: flex;border: 1px solid #ECECEC;align-items: center;">
        <p style="margin:0;width: 15%;padding: 12px;font-size:12px;">${format(
          item.transaction_date ?? new Date(),
          'dd MMM yyyy',
        )}</p>
        <p style="margin:0;width: 25%;padding: 12px 12px 12px 0;font-size:12px;">${
          item?.customer?.name ?? ''
        }</p>
        <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;font-size:12px;">${
          item.note ?? ''
        }</p>
        <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;text-align: center;border-left: 1px solid #ECECEC;border-right: 1px solid #ECECEC;font-size:12px;">
          ${!item.is_collection ? amountWithCurrency(item.total_amount) : ''}
        </p>
        <p style="margin:0;width: 20%;padding: 12px 0;text-align: center;font-size:12px;">
          ${item.amount_paid ? amountWithCurrency(item.amount_paid) : ''}
        </p>
      </div>
    `,
    )
    .join('')}
`;

const customerReportTableHTML = ({data}: {data: IReceipt[]}) => {
  let totalBalance = 0;

  return `
    <div style="height: 30px;display: flex;background: #F5F5F5;align-items: center;margin-bottom: 8px;">
      <p style="margin:0;width: 15%;padding: 12px;font-weight: 700;font-size:12px;">Date</p>
      <p style="margin:0;width: 25%;padding: 12px 12px 12px 0;font-weight: 700;font-size:12px;">Note</p>
      <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;font-weight: 700;font-size:12px;">Total Amount</p>
      <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;text-align: center;font-weight: 700;font-size:12px;">Amount Paid</p>
      <p style="margin:0;width: 20%;text-align: center;font-weight: 700;font-size:12px;padding: 12px 0;">Balance</p>
    </div>
    ${data
      .map((item) => {
        const collectedAmount = item.credit_amount === 0 ? item.amount_paid : 0;
        totalBalance = totalBalance + collectedAmount - item.credit_amount;
        console.log(item.credit_amount, collectedAmount);

        return `
              <div style="display: flex;border: 1px solid #ECECEC;align-items: center;">
                <p style="margin:0;width: 15%;padding: 12px;font-size:12px;">${format(
                  item.transaction_date ?? new Date(),
                  'dd MMM yyyy',
                )}</p>
                <p style="margin:0;width: 25%;padding: 12px 12px 12px 0;font-size:12px;">${
                  item.note ?? ''
                }</p>
                <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;font-size:12px;">
                  ${
                    !item.is_collection
                      ? amountWithCurrency(item.total_amount)
                      : ''
                  }
                </p>
                <p style="margin:0;width: 20%;padding: 12px 12px 12px 0;text-align: center;border-left: 1px solid #ECECEC;border-right: 1px solid #ECECEC;font-size:12px;">
                  ${
                    item.amount_paid ? amountWithCurrency(item.amount_paid) : ''
                  }
                </p>
                <p style="margin:0;width: 20%;padding: 12px 0;text-align: center;font-size:12px;${
                  totalBalance > 0 ? 'color: #25A36E;' : 'color: #DD0404;'
                }">
                  ${totalBalance < 0 ? '-' : ''}${amountWithCurrency(
          totalBalance,
        )}
                </p>
              </div>
          `;
      })
      .join('')}
  `;
};

export const generateUserReportHTML = (options: ReportToHTMLInterface) => {
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
        <html style="padding: 0;margin: 0;box-sizing: border-box;min-height: 100%;">
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
      const pageTwoStart = NO_OF_ITEMS_ON_PAGE_ONE + i;
      let start =
        i === 1 ? pageTwoStart : ITEMS_PER_PAGE * (i - 1) + pageTwoStart;
      const data = itemsOtherPages.slice(start, start + ITEMS_PER_PAGE);
      htmlString.push(`
        <html style="padding: 0;margin: 0;box-sizing: border-box;min-height: 100%;">
          <body style="padding: 0;margin: 0;box-sizing: border-box;position: absolute;width: 100%;height: 100%;">
            ${reportPageHeaderHTML({businessName})}
            <div style="padding: 12px 32px;height: calc(100% - 124px);background-color: white;">
              ${userReportTableHTML({data})}
            </div>
            ${reportPageFooterHTML()}
          </body>
        </html>
      `);
    }
  }

  return htmlString.join('');
};

export const generateCustomerReportHTML = (options: ReportToHTMLInterface) => {
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
        <html style="padding: 0;margin: 0;box-sizing: border-box;min-height: 100%;">
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
              ${customerReportTableHTML({data: itemsOnPageOne})}
            </div>
            ${reportPageFooterHTML()}
          </body>
        </html>
      `);
    } else {
      const pageTwoStart = NO_OF_ITEMS_ON_PAGE_ONE + i;
      let start =
        i === 1 ? pageTwoStart : ITEMS_PER_PAGE * (i - 1) + pageTwoStart;
      const data = itemsOtherPages.slice(start, start + ITEMS_PER_PAGE);
      htmlString.push(`
        <html style="padding: 0;margin: 0;box-sizing: border-box;min-height: 100%;">
          <body style="padding: 0;margin: 0;box-sizing: border-box;position: absolute;width: 100%;height: 100%;">
            ${reportPageHeaderHTML({businessName})}
            <div style="padding: 12px 32px;height: calc(100% - 124px);background-color: white;">
              ${customerReportTableHTML({data})}
            </div>
            ${reportPageFooterHTML()}
          </body>
        </html>
      `);
    }
  }

  return htmlString.join('');
};
