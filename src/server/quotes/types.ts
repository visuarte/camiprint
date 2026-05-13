export const QUANTITY_VALUES = ['10-24', '25-49', '50-99', '100+'] as const;

export type QuantityRange = (typeof QUANTITY_VALUES)[number];

export interface QuoteRequestInput {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: QuantityRange;
  message?: string;
}

export interface QuoteLeadRecord extends QuoteRequestInput {
  id: string;
  source: 'landing-contact-form';
  status: 'received';
  createdAt: string;
  updatedAt: string;
}
