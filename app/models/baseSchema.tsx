import {generateUniqueId} from '../helpers/utils';

export interface BaseModelInterface {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const baseModelSchema = {
  id: {type: 'date', default: generateUniqueId()},
  created_at: {type: 'date', default: new Date()},
  updated_at: {type: 'date', default: new Date()},
};
