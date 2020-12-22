import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {endOfDay, startOfDay, subMonths, subWeeks} from 'date-fns';
import {useCallback, useEffect, useMemo, useState} from 'react';

export type FilterOption = {
  text: string;
  value: string;
  endDate?: Date;
  startDate?: Date;
};

export const useReceiptList = ({initialFilter = 'all'} = {}) => {
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();
  const receipts = getTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [allReceipts, setAllReceipts] = useState(receipts);
  const [filterStartDate, setFilterStartDate] = useState(
    startOfDay(new Date()),
  );
  const [filterEndDate, setFilterEndDate] = useState(endOfDay(new Date()));

  const handleStatusFilter = useCallback(
    (payload: {status: string; startDate?: Date; endDate?: Date}) => {
      const {status, startDate, endDate} = payload;
      setFilter(status);
      startDate && setFilterStartDate(startDate);
      endDate && setFilterEndDate(endDate);
    },
    [],
  );

  const filterOptions = useMemo(
    () => [
      {text: 'All', value: 'all'},
      {
        text: 'Single Day',
        value: 'today',
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date()),
      },
      {
        text: 'Last Week',
        value: '1-week',
        startDate: subWeeks(new Date(), 1),
        endDate: new Date(),
      },
      {
        text: 'Last Month',
        value: '1-month',
        startDate: subMonths(new Date(), 1),
        endDate: new Date(),
      },
      {
        text: 'Date Range',
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
        case 'today':
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
    ) as unknown) as IReceipt[];
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
        case 'today':
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

  const collectedAmount = useMemo(
    () =>
      filteredReceipts
        .map((item) => item.amount_paid)
        .reduce((acc, item) => acc + item, 0),
    [filteredReceipts],
  );
  const outstandingAmount = useMemo(
    () =>
      owedReceipts
        .map((item) => item.credit_amount)
        .reduce((acc, item) => acc + item, 0),
    [owedReceipts],
  );
  const totalAmount = useMemo(
    () =>
      filteredReceipts
        .map((item) => item.total_amount)
        .reduce((acc, item) => acc + item, 0),
    [filteredReceipts],
  );

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myReceipts = getTransactions();
      setAllReceipts(myReceipts);
    });
  }, [getTransactions, navigation]);

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
