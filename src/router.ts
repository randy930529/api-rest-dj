import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { LicenseRoutes } from "./managers/license/routes/license";
import { LicenseUserRoutes } from "./managers/license/routes/licenseUser";
import { profileRoutes } from "./profile/routes/profile";

export const Routes = [
  ...authRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...LicenseRoutes,
  ...LicenseUserRoutes,
];
