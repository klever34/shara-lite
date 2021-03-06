import schema1 from './1598342143007-add-optional-is-deleted-fields';
import schema2 from './1598342143007-restore-fulfilled-in-credits';
import schema3 from './1599807779969-decimal-quantity';
import schema4 from './1599826529206-customer-address';
import schema5 from './1601307197690-add-receipt-image-cancellation-fields';
import schema6 from './1603716195553-add-receipt-note-field';
import schema7 from './1603716195553-add-receipt-note-field';
import schema8 from './1604671961817-add-email-to-customer';
import schema9 from './1606389607325-add-payment-options';
import schema10 from './1606416269345-add-is-hidden-in-pro-to-receipt';
import schema11 from './1608550098360-add-is-collection-x-transaction-date-to-receipt';
import schema12 from './1608634902886-add-payment-reminder';
import schema13 from './1610020714362-add-notes-image-to-customer';
import schema14 from './1610377039908-add-feedback-model';
import schema15 from './1611048927106-add-last-seen-model';

const schemas: any[] = [
  {schemaVersion: 1, ...schema1},
  {schemaVersion: 2, ...schema2},
  {schemaVersion: 3, ...schema3},
  {schemaVersion: 4, ...schema4},
  {schemaVersion: 5, ...schema5},
  {schemaVersion: 6, ...schema6},
  {schemaVersion: 7, ...schema7},
  {schemaVersion: 8, ...schema8},
  {schemaVersion: 9, ...schema9},
  {schemaVersion: 10, ...schema10},
  {schemaVersion: 11, ...schema11},
  {schemaVersion: 12, ...schema12},
  {schemaVersion: 13, ...schema13},
  {schemaVersion: 14, ...schema14},
  {schemaVersion: 15, ...schema15},
];

export default schemas;
