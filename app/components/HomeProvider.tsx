import {IReceipt} from '@/models/Receipt';
import {useRealm} from '@/services/realm';
import {getReceipts} from '@/services/ReceiptService';
import {isToday} from 'date-fns/esm';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

const HomeContext = createContext({
  date: new Date(),
  handleDateChange: (date: Date) => console.log(date),
});

export const useHomeProvider = () => {
  return useContext(HomeContext);
};

export const HomeProvider = ({children}: {children: ReactNode}) => {
  const realm = useRealm();
  const allReceipts = realm ? getReceipts({realm}) : [];

  const getRecentSalesDate = useCallback(() => {
    const realmReceipts = (allReceipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (realmReceipts.length) {
      const receiptsSortedByDate = realmReceipts.sorted('created_at', true);
      const recentReceipt = receiptsSortedByDate[0];
      if (
        recentReceipt &&
        recentReceipt.created_at &&
        !isToday(recentReceipt.created_at)
      ) {
        return recentReceipt.created_at;
      }
    }
    return new Date();
  }, [allReceipts]);
  const [date, setDate] = useState(getRecentSalesDate());

  const handleDateChange = useCallback((selectedDate: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  return (
    <HomeContext.Provider value={{date, handleDateChange}}>
      {children}
    </HomeContext.Provider>
  );
};
