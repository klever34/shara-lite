import {endOfDay, startOfDay, subMonths, subWeeks} from 'date-fns';
import {useCallback, useEffect, useMemo, useState} from 'react';
import uniqBy from 'lodash/uniqBy';
import {getI18nService} from '@/services';
import {FilterOption} from '@/components/TransactionFilterModal';
import {IReceipt} from '@/models/Receipt';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';

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
  const [appliedFilter, setAppliedFilter] = useState('');
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
            'created_at >= $0 && created_at <= $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-week':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-month':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case 'date-range':
          userReceipts = userReceipts.filtered(
            'created_at >= $0 && created_at < $1',
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
        .sorted('created_at', true);
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
    [sharaProCreditPayments, filteredReceipts],
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
