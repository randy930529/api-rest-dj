import { appConfig } from "../../../../config";

export const defaultSectionDataInit = (): string => {
  const { MEa_By_MFP } = appConfig.accountingConstants;
  const data = {
    1: {
      data: {},
      totals: {},
    },
    2: {
      data: { F12: MEa_By_MFP },
    },
    3: {
      data: {},
    },
    4: {
      data: {},
    },
    5: {
      data: {},
    },
    6: {
      data: {},
    },
    7: {
      data: {},
      totals: {},
    },
    8: {
      data: {},
      totals: {},
    },
    9: {
      data: {},
      totals: {},
    },
  };
  return JSON.stringify(data);
};
