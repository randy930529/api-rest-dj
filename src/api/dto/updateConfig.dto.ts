import { Config } from "../../entity/Config";

export type UpdateConfigDTO = {
  id: number;
  email_from?: string;
  license_free_days?: number;
  business_name?: string;
  business_source?: number;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  MEa_By_MFP?: number;
  PPD_PERCENTAGE?: number;
  PE_0_10000?: number;
  PE_10000_20000?: number;
  PE_20000_30000?: number;
  PE_30000_50000?: number;
  PE_ABOVE_50000?: number;
};
