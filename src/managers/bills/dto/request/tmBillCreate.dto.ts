export type TMBillDTO = {
  import: number;
  currency?: string;
  date: Date;
  description?: string;
  orderIdTM?: string;
  bankId?: number;
  bank?: string;
  phone?: string;
  refundId?: number;
  referenceRefund?: number;
  referenceRefundTM?: number;
};
