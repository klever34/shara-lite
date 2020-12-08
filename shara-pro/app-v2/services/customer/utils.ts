import {createContext} from 'react';
import {ICustomer} from 'app-v2/models';

export const CustomerContext = createContext<ICustomer | undefined>(undefined);
