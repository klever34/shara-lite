import {BaseModel, BaseModelInterface, baseModelSchema} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IBNPLRepayment} from '@/services/realm/migrations/1615502330481-add-bnpl-repayment-model-principal_amount-and-bnpl-drawdown-payment_frequency_amount/models/BNPLRepayment';
import {IReceipt} from '@/services/realm/migrations/1608550098360-add-is-collection-x-transaction-date-to-receipt/models/Receipt';
import {ICustomer} from '@/services/realm/migrations/1611256639370-re-add-disable-customer-reminders/models/Customer';

export interface IBNPLDrawdown extends BaseModelInterface {
    amount_drawn?: number;
    amount_repaid?: number;
    amount_owed?: number;
    currency_code?: string;
    repayment_amount?: number;
    repayment_period?: number;
    repayment_period_unit?: string;
    repayment_profile?: string;
    interest_rate?: number;
    interest_rate_unit?: string;
    payment_frequency?: number;
    payment_frequency_unit?: string;
    arrangement_fee?: number;
    arrangement_fee_unit?: string;
    reference?: string;
    status?: string;
    due_at?: Date;
    completed_at?: Date;
    customer?: ICustomer
    receipt?: IReceipt
    api_id?: number;
    bnpl_repayments?: Realm.Results<IBNPLRepayment>;
    payment_frequency_amount?: number;
    takes_charge?: string;
 };

export const modelName = 'BNPLDrawdown';

export class BNPLDrawdown extends BaseModel implements Partial<IBNPLDrawdown> {
    public static schema: Realm.ObjectSchema = {
        name: 'BNPLDrawdown',
        primaryKey: '_id',
        properties: {
            ...baseModelSchema,
            amount_drawn: 'double?',
            amount_repaid: 'double?',
            amount_owed: 'double?',
            currency_code: 'string?',
            repayment_amount: 'double?',
            repayment_period: 'double?',
            repayment_period_unit: 'string?',
            repayment_profile: 'string?',
            interest_rate: 'double?',
            interest_rate_unit: 'string?',
            payment_frequency: 'double?',
            payment_frequency_unit: 'string?',
            arrangement_fee: 'double?',
            arrangement_fee_unit: 'string?',
            reference: 'string?',
            status: 'string?',
            due_at: 'date?',
            completed_at: 'date?',
            customer: 'Customer?',
            receipt: 'Receipt?',
            api_id: 'int?',
            bnpl_repayments: {
                type: 'linkingObjects',
                objectType: 'BNPLRepayment',
                property: 'bnpl_drawdown',
            },
            payment_frequency_amount: 'double?',
            takes_charge: 'string?'
        }
    }
}