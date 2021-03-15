import {FilterOption} from '@/components/TransactionFilterModal';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {getI18nService} from '@/services';
import {useCollection} from '@/services/collection';
import {useDisbursement} from '@/services/disbursement';
import {useWallet} from '@/services/wallet';
import {subMonths, subWeeks} from 'date-fns';
import {useCallback, useMemo, useState} from 'react';

const strings = getI18nService().strings;

interface UsePaymentActivitiesValue {
  filter: string;
  searchTerm: string;
  merchantId?: string;
  filterEndDate: Date;
  filterStartDate: Date;
  walletBalance?: number;
  reloadData: () => void;
  handlePagination: () => void;
  totalReceivedAmount: number;
  totalWithdrawnAmount: number;
  filterOptions?: FilterOption[];
  disbursements: IDisbursement[];
  handleSearch: (text: string) => void;
  collections: (ICollection & Realm.Object)[];
  filteredCollections: Realm.Results<ICollection & Realm.Object>;
  filteredDisbursements: Realm.Results<IDisbursement & Realm.Object>;
  handleFilter: (payload: {
    status: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export type UsePaymentActivitiesOptions = {
  initialFilter?: string;
  filterOptions?: FilterOption[];
};

export const usePaymentActivities = ({
  filterOptions,
  initialFilter = 'all',
}: UsePaymentActivitiesOptions = {}): UsePaymentActivitiesValue => {
  const {getWallet} = useWallet();
  const {getCollections} = useCollection();
  const {getDisbursements} = useDisbursement();

  const wallet = getWallet();
  const collections = getCollections();
  const disbursements = getDisbursements();

  const perPage = 20;
  const walletBalance = wallet?.balance;
  const merchantId = wallet?.merchant_id;
  const collectionTotalCount = collections.length;
  const disbursementTotalCount = collections.length;

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(perPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [filterEndDate, setFilterEndDate] = useState(new Date());
  const [filterStartDate, setFilterStartDate] = useState(new Date());
  const [displayedCollections, setDisplayedCollections] = useState<(ICollection & Realm.Object)[]
  >([]);
  const [displayedDisbursements, setDisplayedDisbursements] = useState<(IDisbursement & Realm.Object)[]
  >([]);

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

  const filteredCollections = useMemo(() => {
    let userCollections = collections;
    if (filter) {
      switch (filter) {
        case 'all':
          userCollections = userCollections;
          break;
        case 'single-day':
          userCollections = userCollections.filtered(
            'created_at >= $0 && created_at <= $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-week':
          userCollections = userCollections.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-month':
          userCollections = userCollections.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case 'date-range':
          userCollections = userCollections.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        default:
          userCollections = userCollections;
          break;
      }
    }
    if (searchTerm) {
      userCollections = userCollections.filtered(
        `customer.name CONTAINS[c] "${searchTerm}"`,
      );
    }
    return userCollections.sorted('created_at', true);
  }, [filter, filterStartDate, filterEndDate, collections.length, searchTerm]);

  const filteredDisbursements = useMemo(() => {
    let userDisbursement = disbursements;
    if (filter) {
      switch (filter) {
        case 'all':
          userDisbursement = userDisbursement;
          break;
        case 'single-day':
          userDisbursement = userDisbursement.filtered(
            'created_at >= $0 && created_at <= $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-week':
          userDisbursement = userDisbursement.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case '1-month':
          userDisbursement = userDisbursement.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        case 'date-range':
          userDisbursement = userDisbursement.filtered(
            'created_at >= $0 && created_at < $1',
            filterStartDate,
            filterEndDate,
          );
          break;
        default:
          userDisbursement = userDisbursement;
          break;
      }
    }
    if (searchTerm) {
      userDisbursement = userDisbursement.filtered(
        `message CONTAINS[c] "${searchTerm}"`,
      );
    }
    return userDisbursement.sorted('created_at', true);
  }, [
    searchTerm,
    disbursements.length,
    filter,
    filterEndDate,
    filterStartDate,
  ]);

  const totalReceivedAmount = useMemo(() => {
    return filteredCollections.sum('amount') ?? 0;
  }, [filteredCollections]);

  const totalWithdrawnAmount = useMemo(() => {
    return filteredDisbursements.filtered('status != "failed"').sum('amount') ?? 0;
  }, [filteredDisbursements]);

  const handleSetDisplayCollections = useCallback(
    (start, end) => {
      const newData = filteredCollections.slice(start, end);

      setDisplayedCollections((prevCollections) => {
        return [...prevCollections, ...newData];
      });
    },
    [filteredCollections],
  );

  const handleSetDisplayDisbursements = useCallback(
    (start, end) => {
      const newData = filteredDisbursements.slice(start, end);

      setDisplayedDisbursements((prevDisbursements) => {
        return [...prevDisbursements, ...newData];
      });
    },
    [filteredDisbursements],
  );

  const handlePagination = useCallback(() => {
    if (collectionTotalCount > end) {
      let startCount = start + perPage;
      let endCount = end + perPage;

      setStart(startCount);
      setEnd(endCount);
      handleSetDisplayCollections(startCount, endCount);
    }
    if (disbursementTotalCount > end) {
      let startCount = start + perPage;
      let endCount = end + perPage;

      setStart(startCount);
      setEnd(endCount);
      handleSetDisplayDisbursements(startCount, endCount);
    }
  }, [
    end,
    start,
    perPage,
    collectionTotalCount,
    disbursementTotalCount,
    handleSetDisplayCollections,
    handleSetDisplayDisbursements,
  ]);

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
      let collectionData = collections;
      let disbursementData = disbursements;

      if (status) {
        switch (status) {
          case 'all':
            collectionData = collectionData;
            disbursementData = disbursementData;
            break;
          case 'single-day':
            collectionData = collectionData.filtered(
              'created_at >= $0 && created_at <= $1',
              startDate,
              endDate,
            );
            disbursementData = disbursementData.filtered(
              'created_at >= $0 && created_at <= $1',
              startDate,
              endDate,
            );
            break;
          case '1-week':
            collectionData = collectionData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            disbursementData = disbursementData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            break;
          case '1-month':
            collectionData = collectionData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            disbursementData = disbursementData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            break;
          case 'date-range':
            collectionData = collectionData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            disbursementData = disbursementData.filtered(
              'created_at >= $0 && created_at < $1',
              startDate,
              endDate,
            );
            break;
          default:
            collectionData = collectionData;
            disbursementData = disbursementData;
            break;
        }
      }
      if (search) {
        collectionData = collectionData.filtered(
          `customer.name CONTAINS[c] "${search}"`,
        );
        disbursementData = disbursementData.filtered(
          `message CONTAINS[c] "${search}"`,
        );
      }

      collectionData = collectionData.sorted('created_at', true);
      disbursementData = disbursementData.sorted('created_at', true);

      const newCollectionData = collectionData.slice(startCount, endCount);
      const newDisbursementData = disbursementData.slice(startCount, endCount);

      setDisplayedCollections((prevCollections) => {
        return [...prevCollections, ...newCollectionData];
      });
      setDisplayedDisbursements((prevDisbursements) => {
        return [...prevDisbursements, ...newDisbursementData];
      });
    },
    [collections, disbursements],
  );

  const handleFilter = useCallback(
    (payload: {status: string; startDate?: Date; endDate?: Date}) => {
      const {status, startDate, endDate} = payload;
      setFilter(status);
      startDate && setFilterStartDate(startDate);
      endDate && setFilterEndDate(endDate);
      setStart(0);
      setEnd(perPage);
      setDisplayedCollections([]);
      setDisplayedDisbursements([]);
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

  const handleSearch = useCallback(
    (text: string) => {
      setSearchTerm(text);
      setStart(0);
      setEnd(perPage);
      setDisplayedCollections([]);
      setDisplayedDisbursements([]);
      handlePaginatedSearchFilter({
        search: text,
        startCount: 0,
        endCount: perPage,
      });
    },
    [handlePaginatedSearchFilter],
  );

  const reloadData = useCallback(() => {
    setStart(0);
    setEnd(perPage);
    setDisplayedCollections([]);
    setDisplayedDisbursements([]);
    handleSetDisplayCollections(0, perPage);
    handleSetDisplayDisbursements(0, perPage);
  }, [perPage, handleSetDisplayCollections, handleSetDisplayDisbursements]);

  return useMemo(
    () => ({
      filter,
      reloadData,
      searchTerm,
      merchantId,
      handleFilter,
      handleSearch,
      filterOptions,
      filterEndDate,
      walletBalance,
      filterStartDate,
      handlePagination,
      filteredCollections,
      totalReceivedAmount,
      totalWithdrawnAmount,
      filteredDisbursements,
      collections: displayedCollections,
      disbursements: displayedDisbursements,
    }),
    [
      filter,
      searchTerm,
      merchantId,
      reloadData,
      collections,
      handleFilter,
      handleSearch,
      filterOptions,
      filterEndDate,
      walletBalance,
      filterStartDate,
      disbursements,
      handlePagination,
      filteredCollections,
      totalReceivedAmount,
      totalWithdrawnAmount,
      filteredDisbursements,
    ],
  );
};
