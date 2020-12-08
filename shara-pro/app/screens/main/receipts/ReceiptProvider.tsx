import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import {IStockItem} from '@/models/StockItem';
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

// eslint-disable-next-line no-spaced-func
const ReceiptContext = createContext<{
  receipt: Receipt;
  inventoryStock: IStockItem[];
  handleClearReceipt: () => void;
  handleClearInventoryStock: () => void;
  handleUpdateReceipt: (data: any) => void;
  createReceiptFromCustomer: ICustomer | undefined;
  handleUpdateInventoryStock: (data: IStockItem[]) => void;
  handleUpdateCreateReceiptFromCustomer: (data: ICustomer) => void;
}>({
  inventoryStock: [],
  receipt: {} as Receipt,
  handleClearReceipt: () => {},
  handleClearInventoryStock: () => {},
  createReceiptFromCustomer: undefined,
  handleUpdateReceipt: (data) => console.log(data),
  handleUpdateInventoryStock: (data) => console.log(data),
  handleUpdateCreateReceiptFromCustomer: (data) => console.log(data),
});

export const useReceiptProvider = () => {
  return useContext(ReceiptContext);
};

export const ReceiptProvider = ({children}: {children: ReactNode}) => {
  const [receipt, setReceipt] = useState<Receipt>({} as Receipt);
  const [inventoryStock, setInventoryStock] = useState<IStockItem[]>([]);
  const [createReceiptFromCustomer, setCreateReceiptFromCustomer] = useState<
    ICustomer | undefined
  >();

  const handleClearReceipt = useCallback(() => {
    setReceipt({} as Receipt);
    setCreateReceiptFromCustomer(undefined);
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
    (data: IStockItem[]) => {
      if (data) {
        setInventoryStock([...inventoryStock, ...data]);
      }
    },
    [inventoryStock],
  );

  const handleUpdateCreateReceiptFromCustomer = useCallback(
    (customer: ICustomer) => {
      if (customer) {
        setCreateReceiptFromCustomer(customer);
      }
    },
    [],
  );

  return (
    <ReceiptContext.Provider
      value={{
        receipt,
        inventoryStock,
        handleClearReceipt,
        handleUpdateReceipt,
        handleClearInventoryStock,
        createReceiptFromCustomer,
        handleUpdateInventoryStock,
        handleUpdateCreateReceiptFromCustomer,
      }}>
      {children}
    </ReceiptContext.Provider>
  );
};
