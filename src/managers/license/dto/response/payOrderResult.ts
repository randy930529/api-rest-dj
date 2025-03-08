export type PayOrderResultDTO = {
  PayOrderResult: {
    Resultmsg: string;
    Success: boolean;
    OrderId: string;
  };
};

export type PaymentStatusOrderDTO = {
  GetStatusOrderResult: {
    Resultmsg: string;
    Success: boolean;
    BankId: string;
    ExternalId: string;
    OrderId: number | string;
    Status: string;
    TmId: string;
    Bank: string;
  };
};
