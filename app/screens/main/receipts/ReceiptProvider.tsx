import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {Customer, Payment} from 'types/app';

interface Receipt {
  tax: number;
  realm: Realm;
  note?: string;
  dueDate?: Date;
  amountPaid: number;
  totalAmount: number;
  payments: Payment[];
  creditAmount: number;
  receiptItems: IReceiptItem[];
  customer: ICustomer | Customer;
}

const ReceiptContext = createContext<{
  receipt: Receipt;
  handleUpdateReceipt: (data: any) => void;
}>({
  receipt: {} as Receipt,
  handleUpdateReceipt: (data) => console.log(data),
});

export const useReceiptProvider = () => {
  return useContext(ReceiptContext);
};

export const ReceiptProvider = ({children}: {children: ReactNode}) => {
  const [receipt, setReceipt] = useState<Receipt>({} as Receipt);

  const handleUpdateReceipt = useCallback(
    (data: any) => {
      if (data) {
        setReceipt({...receipt, ...data});
      }
    },
    [receipt],
  );

  return (
    <ReceiptContext.Provider value={{receipt, handleUpdateReceipt}}>
      {children}
    </ReceiptContext.Provider>
  );
};
