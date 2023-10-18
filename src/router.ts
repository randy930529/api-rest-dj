import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";
import { profileRoutes } from "./profile/routes/profile";

export const Routes = [...authRoutes, ...userRoutes, ...profileRoutes];
