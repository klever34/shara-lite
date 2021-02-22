import {FilterOption} from '@/components/TransactionFilterModal';
import {IActivity} from '@/models/Activity';
import {IReceipt} from '@/models/Receipt';
import {getI18nService} from '@/services';
import {useActivity} from '@/services/activity';
import {useTransaction} from '@/services/transaction';
import {endOfDay, startOfDay, subMonths, subWeeks} from 'date-fns';
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
  filter: string;
  searchTerm: string;
  totalAmount: number;
  filterEndDate: Date;
  filterStartDate: Date;
  reloadData: () => void;
  collectedAmount: number;
  outstandingAmount: number;
  handlePagination: () => void;
  filterOptions?: FilterOption[];
  activitiesToDisplay: IActivity[];
  handleReceiptSearch: (text: string) => void;
  receiptsToDisplay: (IReceipt & Realm.Object)[];
  filteredReceipts: Realm.Results<IReceipt & Realm.Object>;
  handleStatusFilter: (payload: {
    status: string;
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
  const [activitiesToDisplay, setActivitiesToDisplay] = useState<IActivity[]>(
    [],
  );
  const [filter, setFilter] = useState<string>(initialFilter);
  const [appliedFilter, setAppliedFilter] = useState('');
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
    let userReceipts = (receipts as unknown) as Realm.Results<
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
    return (userReceipts.sorted(
      'created_at',
      true,
    ) as unknown) as Realm.Results<IReceipt & Realm.Object>;
  }, [filter, filterStartDate, filterEndDate, receipts.length, searchTerm]);

  const filteredActivities = useMemo(() => {
    let userActivities = activities;
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
  }, [searchTerm, activities.length, filter, filterEndDate, filterStartDate]);

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
    [filteredReceipts, sharaProCreditPayments],
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
  }, [filteredReceipts, appliedFilter, filterStartDate, filterEndDate]);

  const totalAmount = useMemo(() => collectedAmount + outstandingAmount, [
    collectedAmount,
    outstandingAmount,
  ]);

  const handleSetReceiptsToDisplay = useCallback(
    (start, end) => {
      const newData = filteredReceipts.slice(start, end);

      setReceiptsToDisplay((receiptsToDisplay) => {
        return [...receiptsToDisplay, ...newData];
      });
    },
    [filteredReceipts],
  );

  const handlePaginatedSearchFilter = useCallback(
    ({
      search,
      status,
      endDate,
      endCount,
      startDate,
      startCount,
    }: {
      search?: string;
      status?: string;
      endDate?: Date;
      startDate?: Date;
      endCount: number;
      startCount: number;
    }) => {
      let userReceipts = (receipts as unknown) as Realm.Results<
        IReceipt & Realm.Object
      >;
      let userActivities = activities;

      if (status) {
        switch (status) {
          case 'all':
            userReceipts = userReceipts;
            userActivities = userActivities;
            setAppliedFilter('');
            break;
          case 'single-day':
            userReceipts = userReceipts.filtered(
              'created_at >= $0 && created_at <= $1',
              startDate,
              endDate,
            );
            userActivities = userActivities.filtered(
              'created_at >= $0 && created_at <= $1',
              startDate,
              endDate,
            );
            setAppliedFilter('created_at >= $0 && created_at <= $1');
            break;
          case '1-week':
            userReceipts = userReceipts.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            userActivities = userActivities.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            setAppliedFilter('created_at >= $0 && created_at < $1');
            break;
          case '1-month':
            userReceipts = userReceipts.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            userActivities = userActivities.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            setAppliedFilter('created_at >= $0 && created_at < $1');
            break;
          case 'date-range':
            userReceipts = userReceipts.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            userActivities = userActivities.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            setAppliedFilter('created_at >= $0 && created_at < $1');
            break;
          default:
            userReceipts = userReceipts;
            userActivities = userActivities;
            break;
        }
      }
      if (search) {
        userReceipts = userReceipts.filtered(
          `customer.name CONTAINS[c] "${search}"`,
        );
        userActivities = userActivities.filtered(
          `message CONTAINS[c] "${search}"`,
        );
      }
      userReceipts = userReceipts.sorted('created_at', true);
      userActivities = userActivities.sorted('created_at', true);

      const newReceiptData = userReceipts.slice(startCount, endCount);
      const newActivitiesData = userActivities.slice(startCount, endCount);

      setReceiptsToDisplay((receiptsToDisplay) => {
        return [...receiptsToDisplay, ...newReceiptData];
      });
      setActivitiesToDisplay((activitiesToDisplay) => {
        return [...activitiesToDisplay, ...newActivitiesData];
      });
    },
    [receipts.length, activities.length],
  );

  const handleSetActivitiesToDisplay = useCallback(
    (start, end) => {
      const newData = filteredActivities.slice(start, end);

      setActivitiesToDisplay((activitiesToDisplay) => [
        ...activitiesToDisplay,
        ...newData,
      ]);
    },
    [filteredActivities],
  );

  const handlePagination = useCallback(() => {
    if (totalCount > end) {
      let startCount = start + perPage;
      let endCount = end + perPage;

      setStart(startCount);
      setEnd(endCount);
      handleSetReceiptsToDisplay(startCount, endCount);
      handleSetActivitiesToDisplay(startCount, endCount);
    }
  }, [
    end,
    start,
    perPage,
    totalCount,
    handleSetReceiptsToDisplay,
    handleSetActivitiesToDisplay,
  ]);

  const reloadData = useCallback(() => {
    setStart(0);
    setEnd(perPage);
    setReceiptsToDisplay([]);
    setActivitiesToDisplay([]);
    handleSetReceiptsToDisplay(0, perPage);
    handleSetActivitiesToDisplay(0, perPage);
  }, [perPage, handleSetReceiptsToDisplay, handleSetActivitiesToDisplay]);

  const handleStatusFilter = useCallback(
    (payload: {status: string; startDate?: Date; endDate?: Date}) => {
      const {status, startDate, endDate} = payload;
      setFilter(status);
      startDate && setFilterStartDate(startDate);
      endDate && setFilterEndDate(endDate);
      setStart(0);
      setEnd(perPage);
      setReceiptsToDisplay([]);
      setActivitiesToDisplay([]);
      handlePaginatedSearchFilter({
        status,
        endDate,
        startDate,
        startCount: 0,
        endCount: perPage,
      });
    },
    [handlePaginatedSearchFilter],
  );

  const handleReceiptSearch = useCallback(
    (text: string) => {
      setSearchTerm(text);
      setStart(0);
      setEnd(perPage);
      setReceiptsToDisplay([]);
      setActivitiesToDisplay([]);
      handlePaginatedSearchFilter({
        search: text,
        startCount: 0,
        endCount: perPage,
      });
    },
    [handlePaginatedSearchFilter],
  );

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
      handleStatusFilter,
      activitiesToDisplay,
      handleReceiptSearch,
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
      filteredReceipts,
      handlePagination,
      receiptsToDisplay,
      outstandingAmount,
      handleStatusFilter,
      activitiesToDisplay,
      handleReceiptSearch,
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
