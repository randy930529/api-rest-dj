export type CreatePayOrderDTO = {
  request: {
    Amount: number;
    Phone: string;
    Currency: string | "CUP";
    Description: string;
    ExternalId: string;
    Source: number;
    UrlResponse: string;
    ValidTime: number;
  };
};
