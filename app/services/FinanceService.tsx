import {getReceipts} from './ReceiptService';
import {getCredits} from './CreditService';
import Realm from 'realm';

export interface ISummary {
  totalSales: number;
  totalCredit: number;
  overdueCredit: number;
}

export const getSummary = ({realm}: {realm: Realm}): ISummary => {
  const receipts = getReceipts({realm});
  const credits = getCredits({realm});

  const totalSales = getTotalSales({receipts});
  const totalCredit = getTotalCredit({credits});
  const overdueCredit = getOverdueCredit({credits});

  const summary: ISummary = {
    totalSales,
    totalCredit,
    overdueCredit,
  };

  return summary;
};

export const getTotalSales = ({receipts}) => {
  return receipts.sum('total_amount');
};

export const getOverdueCredit = ({credits}) => {
  return credits.filtered('fulfilled = false').sum('amount_left');
};

export const getTotalCredit = ({credits}) => {
  return credits.sum('total_amount');
};

export const getTodayFilter = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  return `created_at >= ${startDate}`;
};
