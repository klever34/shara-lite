import {ICustomer} from '@/models';
import {IProduct} from '@/models/Product';
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
  inventoryStock: IProduct[];
  handleClearReceipt: () => void;
  handleClearInventoryStock: () => void;
  handleUpdateReceipt: (data: any) => void;
  handleUpdateInventoryStock: (data: IProduct[]) => void;
}>({
  inventoryStock: [],
  receipt: {} as Receipt,
  handleClearReceipt: () => {},
  handleClearInventoryStock: () => {},
  handleUpdateReceipt: (data) => console.log(data),
  handleUpdateInventoryStock: (data) => console.log(data),
});

export const useReceiptProvider = () => {
  return useContext(ReceiptContext);
};

export const ReceiptProvider = ({children}: {children: ReactNode}) => {
  const [receipt, setReceipt] = useState<Receipt>({} as Receipt);
  const [inventoryStock, setInventoryStock] = useState<IProduct[]>([]);

  const handleClearReceipt = useCallback(() => {
    setReceipt({} as Receipt);
  }, []);

  const handleClearInventoryStock = useCallback(() => {
    setInventoryStock([]);
  }, []);

  const handleUpdateReceipt = useCallback(
    (data: any) => {
      if (data) {
        setReceipt({...receipt, ...data});
      }
    },
    [receipt],
  );

  const handleUpdateInventoryStock = useCallback(
    (data: IProduct[]) => {
      if (data) {
        setInventoryStock([...inventoryStock, ...data]);
      }
    },
    [inventoryStock],
  );

  return (
    <ReceiptContext.Provider
      value={{
        receipt,
        inventoryStock,
        handleClearReceipt,
        handleUpdateReceipt,
        handleClearInventoryStock,
        handleUpdateInventoryStock,
      }}>
      {children}
    </ReceiptContext.Provider>
  );
};
