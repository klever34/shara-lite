import {FilterOption} from '@/components/TransactionFilterModal';
import {IActivity} from '@/models/Activity';
import {IReceipt} from '@/models/Receipt';
import {getI18nService} from '@/services';
import {useActivity} from '@/services/activity';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {endOfDay, startOfDay, subMonths, subWeeks} from 'date-fns';
import {omit} from 'lodash';
import uniqBy from 'lodash/uniqBy';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const strings = getI18nService().strings;

interface TransactionListContextValue {
  filter?: string;
  searchTerm: string;
  totalAmount: number;
  filterEndDate: Date;
  filterStartDate: Date;
  reloadData: () => void;
  collectedAmount: number;
  outstandingAmount: number;
  handlePagination: () => void;
  filterOptions?: FilterOption[];
  remindersToDisplay: IActivity[];
  handleSetReceiptsToDisplay: (start: number, end: number) => void;
  handleSetRemindersToDisplay: (start: number, end: number) => void;
  handleReceiptSearch: (text: string) => void;
  filteredActivities: Realm.Results<IActivity>;
  receiptsToDisplay: (IReceipt & Realm.Object)[];
  filteredReceipts: Realm.Results<IReceipt & Realm.Object>;
  handleStatusFilter: (payload: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

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
  const {getActivities} = useActivity();
  const {getTransactions} = useTransaction();
  receipts = receipts ?? getTransactions();
  let activities = getActivities();
  const perPage = 20;
  const totalCount = receipts.length;

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(perPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptsToDisplay, setReceiptsToDisplay] = useState<
    (IReceipt & Realm.Object)[]
  >([]);
  const [remindersToDisplay, setRemindersToDisplay] = useState<IActivity[]>([]);
  const [filter, setFilter] = useState<string | undefined>(initialFilter);
  const [appliedFilter, setAppliedFilter] = useState('');
  const [allReceipts, setAllReceipts] = useState(receipts);
  const [allActivities, setAllActivities] = useState(activities);
  const [filterStartDate, setFilterStartDate] = useState(
    startOfDay(new Date()),
  );
  const [filterEndDate, setFilterEndDate] = useState(endOfDay(new Date()));

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

  const filteredReceipts = useMemo(() => {
    let userReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (filter) {
      switch (filter) {
        case 'all':
          userReceipts = userReceipts;
          setAppliedFilter('');
          break;
        case 'single-day':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at <= $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at <= $1');
          break;
        case '1-week':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
          break;
        case '1-month':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
          break;
        case 'date-range':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
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
    // console.log(userReceipts.sorted('created_at', true).length, 'userReceipts');
    return (userReceipts.sorted(
      'created_at',
      true,
    ) as unknown) as Realm.Results<IReceipt & Realm.Object>;
  }, [filter, filterStartDate, filterEndDate, allReceipts, searchTerm]);

  const filteredActivities = useMemo(() => {
    let userActivities = allActivities;
    if (filter) {
      switch (filter) {
        case 'all':
          userActivities = userActivities;
          setAppliedFilter('');
          break;
        case 'single-day':
          userActivities = userActivities.filtered(
            'created_at >= $0 && created_at <= $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at <= $1');
          break;
        case '1-week':
          userActivities = userActivities.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
          break;
        case '1-month':
          userActivities = userActivities.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
          break;
        case 'date-range':
          userActivities = userActivities.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          setAppliedFilter('created_at >= $0 && created_at < $1');
          break;
        default:
          userActivities = userActivities;
          break;
      }
    }
    if (searchTerm) {
      userActivities = userActivities.filtered(
        `message CONTAINS[c] "${searchTerm}"`,
      );
    }
    return userActivities.sorted('created_at', true);
  }, [searchTerm, allActivities, filter, filterEndDate, filterStartDate]);

  const sharaProCreditPayments = useMemo(
    () =>
      filteredReceipts.reduce(
        // @ts-ignore
        (total: number, receipt) => {
          if (!receipt.credits || !receipt.credits.length) {
            return total;
          }

          const payments =
            receipt.credits[0].total_amount - receipt.credits[0].amount_left;
          return total + payments;
        },
        0,
      ),
    [filteredReceipts],
  );

  const collectedAmount = useMemo(
    () => (filteredReceipts.sum('amount_paid') || 0) + sharaProCreditPayments,
    [sharaProCreditPayments, filteredReceipts.length],
  );

  const outstandingAmount = useMemo(() => {
    const allCustomers = filteredReceipts
      .map((receipt) => receipt.customer)
      .filter((customer) => customer);
    const uniqueCustomers = uniqBy(allCustomers, (customer) =>
      customer?._id?.toString(),
    );

    const transactionFilter = appliedFilter || 'is_deleted != true';

    // @ts-ignore
    const totalBalance = uniqueCustomers.reduce((total: number, customer) => {
      const customerCollectedAmount =
        customer?.collections
          ?.filtered(transactionFilter, filterStartDate, filterEndDate)
          .sum('amount_paid') || 0;
      const creditAmount =
        customer?.activeReceipts
          ?.filtered(transactionFilter, filterStartDate, filterEndDate)
          .sum('credit_amount') || 0;

      const sharaProCredits = customer?.activeCredits?.filtered(
        transactionFilter.replace(/transaction_date/g, 'created_at'),
        filterStartDate,
        filterEndDate,
      );
      const sharaProCreditsAmountLeft =
        sharaProCredits?.sum('amount_left') || 0;
      const sharaProCreditsTotal = sharaProCredits?.sum('total_amount') || 0;
      const sharaProPayments = sharaProCreditsTotal - sharaProCreditsAmountLeft;

      const balance =
        creditAmount - (customerCollectedAmount + sharaProPayments);
      const overdueBalance = balance < 0 ? 0 : balance;
      return total + overdueBalance;
    }, 0);

    return totalBalance;
  }, [filteredReceipts.length, appliedFilter, filterStartDate, filterEndDate]);

  const totalAmount = useMemo(() => collectedAmount + outstandingAmount, [
    collectedAmount,
    outstandingAmount,
  ]);

  const handleSetReceiptsToDisplay = useCallback(
    (start, end) => {
      console.log(filteredReceipts.length, 'filteredReceipts1');
      const newData = filteredReceipts.slice(start, end);

      setReceiptsToDisplay((receiptsToDisplay) => {
        return [...receiptsToDisplay, ...newData];
      });
    },
    [filteredReceipts.length],
  );

  console.log(filteredReceipts.length, 'filteredReceipts2');

  const handleSetRemindersToDisplay = useCallback(
    (start, end) => {
      const newData = filteredActivities.slice(start, end);

      setRemindersToDisplay((remindersToDisplay) => [
        ...remindersToDisplay,
        ...newData,
      ]);
    },
    [filteredActivities.length],
  );

  const handlePagination = useCallback(() => {
    if (totalCount > end) {
      let startCount = start + perPage;
      let endCount = end + perPage;

      setStart(startCount);
      setEnd(endCount);
      handleSetReceiptsToDisplay(startCount, endCount);
      handleSetRemindersToDisplay(startCount, endCount);
    }
  }, [
    end,
    start,
    perPage,
    totalCount,
    handleSetReceiptsToDisplay,
    handleSetRemindersToDisplay,
  ]);

  const handleResetData = useCallback(() => {
    setStart(0);
    setEnd(perPage);
    setReceiptsToDisplay([]);
    setRemindersToDisplay([]);
    handleSetReceiptsToDisplay(0, perPage);
    handleSetRemindersToDisplay(0, perPage);
  }, [perPage, handleSetReceiptsToDisplay, handleSetRemindersToDisplay]);

  const handleStatusFilter = useCallback(
    (payload: {status?: string; startDate?: Date; endDate?: Date}) => {
      const {status, startDate, endDate} = payload;
      setFilter(status);
      startDate && setFilterStartDate(startDate);
      endDate && setFilterEndDate(endDate);
      handleResetData();
    },
    [handleResetData],
  );

  const handleReceiptSearch = useCallback(
    (text: string) => {
      setSearchTerm(text);
      handleSetReceiptsToDisplay(0, perPage);
    },
    [handleSetReceiptsToDisplay],
  );

  const reloadData = useCallback(() => {
    const myReceipts = receipts ?? getTransactions();
    const myActivities = getActivities();
    setAllReceipts(myReceipts);
    setAllActivities(myActivities);
    handleResetData();
  }, [receipts.length, getTransactions, handleResetData, getActivities]);

  return useMemo(
    () => ({
      filter,
      reloadData,
      searchTerm,
      totalAmount,
      filterOptions,
      filterEndDate,
      collectedAmount,
      filterStartDate,
      filteredReceipts,
      handlePagination,
      outstandingAmount,
      receiptsToDisplay,
      filteredActivities,
      handleStatusFilter,
      remindersToDisplay,
      handleReceiptSearch,
      handleSetReceiptsToDisplay,
      handleSetRemindersToDisplay,
    }),
    [
      filter,
      reloadData,
      searchTerm,
      totalAmount,
      filterEndDate,
      filterOptions,
      filterStartDate,
      collectedAmount,
      handlePagination,
      filteredReceipts,
      receiptsToDisplay,
      outstandingAmount,
      filteredActivities,
      handleStatusFilter,
      remindersToDisplay,
      handleReceiptSearch,
      handleSetReceiptsToDisplay,
      handleSetRemindersToDisplay,
    ],
  );
};

const TransactionListContext = createContext<TransactionListContextValue>(
  {} as TransactionListContextValue,
);

export const useTransactionList = (): TransactionListContextValue => {
  return useContext(TransactionListContext);
};

export const TransactionListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const data = useReceiptList();
  return (
    <TransactionListContext.Provider value={data}>
      {children}
    </TransactionListContext.Provider>
  );
};
