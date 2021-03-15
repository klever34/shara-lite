import {FilterOption} from '@/components/TransactionFilterModal';
import {ICustomer} from '@/models';
import {getI18nService} from '@/services';
import {orderBy} from 'lodash';
import {useCallback, useMemo, useState} from 'react';

const strings = getI18nService().strings;

interface UseCustomerListOptions {
  customers: ICustomer[];
  orderByOptions?: {
    orderByQuery: string[];
    orderByOrder:
      | boolean
      | 'asc'
      | 'desc'
      | readonly (boolean | 'asc' | 'desc')[]
      | undefined;
  };
  initialFilter?: string;
  filterOptions?: FilterOption[];
}

export const useCustomerList = (options: UseCustomerListOptions) => {
  let {
    orderByOptions,
    filterOptions,
    initialFilter = 'all',
    customers: customersData,
  } = options;
  const {orderByOrder = ['desc', 'asc'], orderByQuery = ['debtLevel', 'name']} =
    orderByOptions ?? {};

  const perPage = 20;
  const totalCount = customersData.length;

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(perPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | undefined>(initialFilter);
  const [customersToDisplay, setCustomersToDisplay] = useState<
    (ICustomer & Realm.Object)[]
  >([]);

  const filteredCustomers = useMemo(() => {
    let customers = (customersData as unknown) as Realm.Results<
      ICustomer & Realm.Object
    >;
    if (searchTerm) {
      customers = customers.filtered(
        `name CONTAINS[c] "${searchTerm}" OR mobile CONTAINS[c] "${searchTerm}"`,
      );
    }
    if (filter) {
      switch (filter) {
        case 'all':
          customers = customers;
          break;
        case 'owing':
          customers = (customers.filter(
            (item) => item?.balance && item?.balance < 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        case 'not-owing':
          customers = (customers.filter(
            (item) => item?.balance !== undefined && item?.balance >= 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        case 'surplus':
          customers = (customers.filter(
            (item) => item?.balance && item?.balance > 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        default:
          customers = customers;
          break;
      }
    }
    return orderBy(
      customers,
      orderByQuery as (keyof ICustomer)[],
      orderByOrder,
    );
  }, [filter, customersData.length, searchTerm]);

  filterOptions =
    filterOptions ??
    useMemo(
      () => [
        {text: 'All', value: 'all'},
        {
          text: strings('filter_options.owing'),
          value: 'owing',
        },
        {
          text: strings('filter_options.not_owing'),
          value: 'not-owing',
        },
        {
          text: strings('filter_options.surplus'),
          value: 'surplus',
        },
      ],
      [],
    );

  const handleSetCustomersToDisplay = useCallback(
    (start, end) => {
      const newData = filteredCustomers.slice(start, end);

      setCustomersToDisplay((customersToDisplay) => {
        return [...customersToDisplay, ...newData];
      });
    },
    [filteredCustomers],
  );

  const handlePaginatedSearchFilter = useCallback(
    ({
      search,
      status,
      endCount,
      startCount,
    }: {
      search?: string;
      status?: string;
      endCount: number;
      startCount: number;
    }) => {
      let customers = (customersData as unknown) as Realm.Results<
        ICustomer & Realm.Object
      >;
      if (search) {
        customers = customers.filtered(
          `name CONTAINS[c] "${search}" OR mobile CONTAINS[c] "${search}"`,
        );
      }
      if (status) {
        switch (status) {
          case 'all':
            customers = customers;
            break;
          case 'owing':
            customers = (customers.filter(
              (item) => item?.balance && item?.balance < 0,
            ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
            break;
          case 'not-owing':
            customers = (customers.filter(
              (item) => item?.balance !== undefined && item?.balance >= 0,
            ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
            break;
          case 'surplus':
            customers = (customers.filter(
              (item) => item?.balance && item?.balance > 0,
            ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
            break;
          default:
            customers = customers;
            break;
        }
      }
      //@ts-ignore
      customers = orderBy(
        customers,
        orderByQuery as (keyof ICustomer)[],
        orderByOrder,
      );

      const newCustomerData = customers.slice(startCount, endCount);

      setCustomersToDisplay((customersToDisplay) => {
        return [...customersToDisplay, ...newCustomerData];
      });
    },
    [customersData.length],
  );

  const handlePagination = useCallback(() => {
    if (totalCount > end) {
      let startCount = start + perPage;
      let endCount = end + perPage;

      setStart(startCount);
      setEnd(endCount);
      handleSetCustomersToDisplay(startCount, endCount);
    }
  }, [end, start, perPage, totalCount, handleSetCustomersToDisplay]);

  const reloadData = useCallback(() => {
    setStart(0);
    setEnd(perPage);
    setCustomersToDisplay([]);
    handleSetCustomersToDisplay(0, perPage);
  }, [perPage, handleSetCustomersToDisplay]);

  const handleStatusFilter = useCallback(
    (payload: {status?: string}) => {
      const {status} = payload;
      setFilter(status);
      setStart(0);
      setEnd(perPage);
      setCustomersToDisplay([]);
      handlePaginatedSearchFilter({
        status,
        startCount: 0,
        endCount: perPage,
      });
    },
    [handlePaginatedSearchFilter],
  );

  const handleCustomerSearch = useCallback(
    (text: string) => {
      setSearchTerm(text);
      setStart(0);
      setEnd(perPage);
      setCustomersToDisplay([]);
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
      searchTerm,
      reloadData,
      filterOptions,
      handlePagination,
      filteredCustomers,
      customersToDisplay,
      handleStatusFilter,
      handleCustomerSearch,
    }),
    [
      filter,
      searchTerm,
      reloadData,
      filterOptions,
      handlePagination,
      filteredCustomers,
      customersToDisplay,
      handleStatusFilter,
      handleCustomerSearch,
    ],
  );
};
