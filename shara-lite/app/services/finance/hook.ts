import {useReceipt} from '@/services/receipt';
import {useCredit} from '@/services/credit';

export interface IFinanceSummary {
  totalSales: number;
  totalCredit: number;
  overdueCredit: number;
}

interface usePaymentInterface {
  getSummary: () => IFinanceSummary;
  getTotalSales: (params: any) => number;
  getOverdueCredit: (params: any) => number;
  getTotalCredit: (params: any) => number;
}

export const useFinance = (): usePaymentInterface => {
  const {getReceipts} = useReceipt();
  const {getCredits} = useCredit();

  const getSummary = (): IFinanceSummary => {
    const receipts = getReceipts();
    const credits = getCredits();

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

  const getTotalSales = ({receipts}: any) => {
    return receipts.sum('total_amount');
  };

  const getOverdueCredit = ({credits}: any) => {
    const today = getToday();
    return credits
      .filtered('fulfilled = false AND due_date < $0', today)
      .sum('amount_left');
  };

  const getTotalCredit = ({credits}: any) => {
    return credits.filtered('fulfilled = false').sum('amount_left');
  };

  const getToday = () => {
    const startDate = new Date();
    // startDate.setHours(0, 0, 0, 0);

    return startDate;
  };

  return {
    getSummary,
    getTotalSales,
    getOverdueCredit,
    getTotalCredit,
  };
};
