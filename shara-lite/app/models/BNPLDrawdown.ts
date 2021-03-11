import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IBNPLRepayment} from './BNPLRepayment';
import {ICustomer} from './Customer';
import {IReceipt} from './Receipt';

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
    bnpl_repayments?: Realm.Results<IBNPLRepayment>
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
        }
    }
}