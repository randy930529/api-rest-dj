import nodemailer from "nodemailer";
import { ENV } from "./settings/environment";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: ENV.auth,
});
