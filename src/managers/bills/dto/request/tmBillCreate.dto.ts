export type TMBillDTO = {
  import: number;
  currency?: string;
  description?: string;
  orderIdTM?: string;
  bankId?: number;
  bank?: string;
  phone?: string;
  refundId?: number;
  referenceRefund?: number;
  referenceRefundTM?: number;
  validDate?: Date;
};
