import { apiConfigRoutes } from "./api/routes/apiConfig";
import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { accountRoutes } from "./managers/expenses/routes/account";
import { elementRoutes } from "./managers/expenses/routes/element";
import { supportDocumentRoutes } from "./managers/expenses/routes/supportDocument";
import { voucherRoutes } from "./managers/expenses/routes/voucher";
import { voucherDetailRoutes } from "./managers/expenses/routes/voucherDetail";
import { hiredPersonRoutes } from "./managers/hire/routes/hirePerson";
import { profileHiredPersonRoutes } from "./managers/hire/routes/profileHirePerson";
import { licenseRoutes } from "./managers/license/routes/license";
import { licenseUserRoutes } from "./managers/license/routes/licenseUser";
import { fiscalYearRoutes } from "./managers/period/routes/fiscalYear";
import { profileRoutes } from "./profile/routes/profile";
import { sectionRoutes } from "./section/routes/section";
import { stateTMBillRoutes } from "./managers/bills/routes/stateTMBill";

export const Routes = [
  ...apiConfigRoutes,
  ...authRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...hiredPersonRoutes,
  ...profileHiredPersonRoutes,
  ...licenseRoutes,
  ...licenseUserRoutes,
  ...fiscalYearRoutes,
  ...elementRoutes,
  ...supportDocumentRoutes,
  ...voucherRoutes,
  ...accountRoutes,
  ...voucherDetailRoutes,
  ...sectionRoutes,
  ...stateTMBillRoutes,
];
