import {createContext} from 'react';
import {ICustomer} from 'app-v1/models';

export const CustomerContext = createContext<ICustomer | undefined>(undefined);
