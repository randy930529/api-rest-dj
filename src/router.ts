import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { accountRoutes } from "./managers/expenses/routes/account";
import { expenseElementRoutes } from "./managers/expenses/routes/expenseElement";
import { supportDocumentRoutes } from "./managers/expenses/routes/supportDocument";
import { voucherRoutes } from "./managers/expenses/routes/voucher";
import { voucherDetailRoutes } from "./managers/expenses/routes/voucherDetail";
import { hiredPersonRoutes } from "./managers/hire/routes/hirePerson";
import { profileHiredPersonRoutes } from "./managers/hire/routes/profileHirePerson";
import { LicenseRoutes } from "./managers/license/routes/license";
import { LicenseUserRoutes } from "./managers/license/routes/licenseUser";
import { fiscalYearRoutes } from "./managers/period/routes/fiscalYear";
import { profileRoutes } from "./profile/routes/profile";

export const Routes = [
  ...authRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...hiredPersonRoutes,
  ...profileHiredPersonRoutes,
  ...LicenseRoutes,
  ...LicenseUserRoutes,
  ...fiscalYearRoutes,
  ...expenseElementRoutes,
  ...supportDocumentRoutes,
  ...voucherRoutes,
  ...accountRoutes,
  ...voucherDetailRoutes,
];
