import {generateUniqueId} from './utils';

export const getBaseModelValues = () => {
  return {
    id: generateUniqueId(),
    created_at: new Date(),
    updated_at: new Date(),
  };
};
