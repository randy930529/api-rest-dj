import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { hiredPersonRoutes } from "./managers/hire/routes/hirePerson";
import { profileHiredPersonRoutes } from "./managers/hire/routes/profileHirePerson";
import { profileRoutes } from "./profile/routes/profile";

export const Routes = [
  ...authRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...hiredPersonRoutes,
  ...profileHiredPersonRoutes,
];
