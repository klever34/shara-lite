import {getReceipts} from './ReceiptService';
import {getCredits} from './CreditService';
import Realm from 'realm';

export interface IFinanceSummary {
  totalSales: number;
  totalCredit: number;
  overdueCredit: number;
}

export const getSummary = ({realm}: {realm: Realm}): IFinanceSummary => {
  const receipts = getReceipts({realm});
  const credits = getCredits({realm});

  const totalSales = getTotalSales({receipts});
  const totalCredit = getTotalCredit({credits});
  const overdueCredit = getOverdueCredit({credits});

  const summary: IFinanceSummary = {
    totalSales,
    totalCredit,
    overdueCredit,
  };

  return summary;
};

export const getTotalSales = ({receipts}: any) => {
  return receipts.sum('total_amount');
};

export const getOverdueCredit = ({credits}: any) => {
  const today = getToday();
  return credits
    .filtered('fulfilled = false AND due_date < $0', today)
    .sum('amount_left');
};

export const getTotalCredit = ({credits}: any) => {
  return credits.filtered('fulfilled = false').sum('amount_left');
};

export const getToday = () => {
  const startDate = new Date();
  // startDate.setHours(0, 0, 0, 0);

  return startDate;
};
