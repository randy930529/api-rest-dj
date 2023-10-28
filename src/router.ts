import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { expenseElementRoutes } from "./managers/expenses/routes/expenseElement";
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
];
