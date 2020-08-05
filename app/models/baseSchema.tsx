export interface BaseModelInterface {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const baseModelSchema = {
  id: 'string',
  created_at: 'date?',
  updated_at: 'date?',
};
