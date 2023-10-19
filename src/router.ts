import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { hiredPersonRoutes } from "./managers/hire/routes/hirePerson";
import { profileRoutes } from "./profile/routes/profile";

export const Routes = [
  ...authRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...hiredPersonRoutes,
];
