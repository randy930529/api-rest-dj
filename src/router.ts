import { authRoutes } from "./auth/routes/auth";
import { userRoutes } from "./auth/routes/user";

export const Routes = [...authRoutes, ...userRoutes];
