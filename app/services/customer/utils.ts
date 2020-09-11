import {createContext} from 'react';
import {ICustomer} from '@/models';

export const CustomerContext = createContext<ICustomer | null>(null);
