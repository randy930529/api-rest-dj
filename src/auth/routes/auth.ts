import { AuthController } from "../controller/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { userMiddleware } from "../middlewares/userMiddleware";
import { authParserMiddleware } from "../middlewares/authValidatorMiddleware";
import { nextFunction } from "../middlewares/nextMiddleware";

export const authRoutes = [
  {
    method: "post",
    route: "/register",
    controller: AuthController,
    middlewares: [authParserMiddleware],
    action: "register",
  },
  {
    method: "post",
    route: "/login",
    controller: AuthController,
    middlewares: [nextFunction],
    action: "login",
  },
  {
    method: "post",
    route: "/refresh/token",
    controller: AuthController,
    middlewares: [nextFunction],
    action: "refreshToken",
  },
  {
    method: "post",
    route: "/jwt/verify",
    controller: AuthController,
    middlewares: [authMiddleware],
    action: "jwtVerify",
  },
  {
    method: "post",
    route: "/user/activation",
    controller: AuthController,
    middlewares: [authMiddleware, userMiddleware],
    action: "userActivation",
  },
  {
    method: "post",
    route: "/user/resend_activation",
    controller: AuthController,
    middlewares: [nextFunction],
    action: "userResendActivation",
  },
  {
    method: "post",
    route: "/user/set_password",
    controller: AuthController,
    middlewares: [authMiddleware],
    action: "userSetPassword",
  },
  {
    method: "post",
    route: "/user/reset_password",
    controller: AuthController,
    middlewares: [nextFunction],
    action: "userResetPassword",
  },
  {
    method: "post",
    route: "/user/reset_password_confirm",
    controller: AuthController,
    middlewares: [authMiddleware, userMiddleware],
    action: "userResetPasswordConfirm",
  },
];
