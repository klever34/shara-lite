import schema1 from './1598342143007-add-optional-is-deleted-fields';
import schema2 from './1598342143007-restore-fulfilled-in-credits';
import schema3 from './1599807779969-decimal-quantity';
import schema4 from './1599826529206-customer-address';

const schemas: any[] = [
  {schemaVersion: 1, ...schema1},
  {schemaVersion: 2, ...schema2},
  {schemaVersion: 3, ...schema3},
  {schemaVersion: 4, ...schema4},
];

export default schemas;
