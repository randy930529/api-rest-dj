export type CreatePayOrderDTO = {
  request: {
    Amount: number;
    Phone: string;
    Currency: string;
    Description: string;
    ExternalId: string;
    Source: string;
    UrlResponse: string;
    ValidTime: number;
  };
};
