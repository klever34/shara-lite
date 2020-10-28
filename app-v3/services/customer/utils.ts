import {createContext} from 'react';
import {ICustomer} from 'app-v3/models';

export const CustomerContext = createContext<ICustomer | undefined>(undefined);
