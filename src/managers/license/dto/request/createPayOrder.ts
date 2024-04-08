export type CreatePayOrderDTO = {
  request: {
    Amount: number;
    Phone: string;
    Currency: string | "CUP";
    Description: string;
    ExternalId: string;
    Source: string;
    UrlResponse: string;
    ValidTime: number;
  };
};
