import {FilterOption} from '@/components/TransactionFilterModal';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {endOfDay, startOfDay, subMonths, subWeeks} from 'date-fns';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type UseReceiptListProps = {
  receipts?: IReceipt[];
  initialFilter?: string;
  filterOptions?: FilterOption[];
};

export const useReceiptList = ({
  receipts,
  filterOptions,
  initialFilter = 'all',
}: UseReceiptListProps = {}) => {
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();
  receipts = receipts ?? getTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | undefined>(initialFilter);
  const [allReceipts, setAllReceipts] = useState(receipts);
  const [filterStartDate, setFilterStartDate] = useState(
    startOfDay(new Date()),
  );
  const [filterEndDate, setFilterEndDate] = useState(endOfDay(new Date()));

  const handleStatusFilter = useCallback(
    (payload: {status?: string; startDate?: Date; endDate?: Date}) => {
      const {status, startDate, endDate} = payload;
      setFilter(status);
      startDate && setFilterStartDate(startDate);
      endDate && setFilterEndDate(endDate);
    },
    [],
  );

  filterOptions =
    filterOptions ??
    useMemo(
      () => [
        {text: strings('all'), value: 'all'},
        {
          text: strings('receipts.filter_options.single_day'),
          value: 'single-day',
        },
        {
          text: strings('receipts.filter_options.1_week'),
          value: '1-week',
          startDate: subWeeks(new Date(), 1),
          endDate: new Date(),
        },
        {
          text: strings('receipts.filter_options.1_month'),
          value: '1-month',
          startDate: subMonths(new Date(), 1),
          endDate: new Date(),
        },
        {
          text: strings('receipts.filter_options.date_range'),
          value: 'date-range',
        },
      ],
      [],
    );

  const handleReceiptSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const filteredReceipts = useMemo(() => {
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (filter) {
      switch (filter) {
        case 'all':
          userReceipts = userReceipts;
          break;
        case 'single-day':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date <= $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-week':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-month':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case 'date-range':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        default:
          userReceipts = userReceipts;
          break;
      }
    }
    if (searchTerm) {
      userReceipts = userReceipts.filtered(
        `customer.name CONTAINS[c] "${searchTerm}"`,
      );
    }
    return (userReceipts.sorted(
      'transaction_date',
      true,
    ) as unknown) as Realm.Results<IReceipt & Realm.Object>;
  }, [filter, filterStartDate, filterEndDate, allReceipts, searchTerm]);

  const owedReceipts = useMemo(() => {
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (filter) {
      switch (filter) {
        case 'all':
          userReceipts = userReceipts;
          break;
        case 'single-day':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date <= $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-week':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-month':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case 'date-range':
          userReceipts = userReceipts.filtered(
            'transaction_date >= $0 && transaction_date < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        default:
          userReceipts = userReceipts;
          break;
      }
    }
    if (searchTerm) {
      userReceipts = userReceipts
        .filtered(`customer.name CONTAINS[c] "${searchTerm}"`)
        .sorted('transaction_date', true);
    }
    return userReceipts.filter((item) => !item.isPaid);
  }, [filter, filterStartDate, filterEndDate, allReceipts, searchTerm]);

  const sharaProCreditPayments = useMemo(
    () =>
      filteredReceipts.reduce(
        // @ts-ignore
        (total: number, receipt) => {
          if (!receipt.credits || !receipt.credits.length) {
            return total;
          }

          const payments = receipt.credits[0].payments;

          return total + (payments ? payments.sum('amount_paid') || 0 : 0);
        },
        0,
      ),
    [filteredReceipts],
  );

  const collectedAmount = useMemo(
    () => (filteredReceipts.sum('amount_paid') || 0) + sharaProCreditPayments,
    [sharaProCreditPayments, filteredReceipts],
  );

  const outstandingAmount = useMemo(() => {
    const totalCreditAmount = filteredReceipts.sum('credit_amount') || 0;
    const totalCollectedAmount =
      filteredReceipts
        .filtered('is_collection != true AND credit_amount = 0')
        .sum('amount_paid') || 0;

    const balance =
      totalCreditAmount - totalCollectedAmount + sharaProCreditPayments;
    return balance < 0 ? 0 : balance;
  }, [sharaProCreditPayments, filteredReceipts]);

  const totalAmount = useMemo(() => collectedAmount + outstandingAmount, [
    collectedAmount,
    outstandingAmount,
  ]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myReceipts = receipts ?? getTransactions();
      setAllReceipts(myReceipts);
    });
  }, [receipts, getTransactions, navigation]);

  return useMemo(
    () => ({
      filter,
      searchTerm,
      totalAmount,
      owedReceipts,
      filterOptions,
      filterEndDate,
      collectedAmount,
      filterStartDate,
      filteredReceipts,
      outstandingAmount,
      handleStatusFilter,
      handleReceiptSearch,
    }),
    [
      filter,
      searchTerm,
      totalAmount,
      owedReceipts,
      filterEndDate,
      filterOptions,
      filterStartDate,
      collectedAmount,
      filteredReceipts,
      outstandingAmount,
      handleStatusFilter,
      handleReceiptSearch,
    ],
  );
};
