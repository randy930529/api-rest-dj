import * as nodemailer from "nodemailer";
import { User } from "../entity/User";
import { ENV } from "./settings/environment";
import * as pug from "pug";
import { convert } from "html-to-text";

const smtp = {
  host: ENV.emailHost,
  port: ENV.emailPort,
  secure: ENV.emailSecure,
  auth: ENV.auth,
};

export default class Email {
  emailUser: string;
  to: string;
  from: string;
  constructor(public user: User, public url: string) {
    this.emailUser = user.email.split(" ")[0];
    this.to = user.email;
    this.from = `Codevo ${ENV.emailFrom}`;
  }

  private newTransport() {
    return nodemailer.createTransport(smtp);
  }

  private async send(template: string, subject: string) {
    // Generate HTML template based on the template string
    const html = pug.renderFile(`${__dirname}/views/${template}.pug`, {
      emailUser: this.emailUser,
      subject,
      url: this.url,
    });

    // Create mailOptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };

    // Send email
    const info = await this.newTransport().sendMail(mailOptions);
    console.log(nodemailer.getTestMessageUrl(info));
  }

  async sendVerificationCode() {
    await this.send("verificationCode", "Your account verification code");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPassword",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
}