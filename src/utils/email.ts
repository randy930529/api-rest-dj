import * as nodemailer from "nodemailer";
import { User } from "../entity/User";
import { ENV } from "./settings/environment";
import * as pug from "pug";
import { convert } from "html-to-text";

const smtp =
  ENV.debug === "staging"
    ? {
        service: "Yahoo",
        secure: ENV.emailSecure,
        auth: ENV.auth,
      }
    : {
        host: ENV.emailHost,
        port: ENV.emailPort,
        secure: ENV.emailSecure,
        auth: ENV.auth,
        tls: ENV.tls,
      };

export default class Email {
  emailUser: string;
  to: string;
  from: string;
  constructor(public user: User, public url: string) {
    this.emailUser = user.email.split(" ")[0];
    this.to = user.email;
    this.from = `CA-Mygestor ${ENV.emailFrom}`;
  }

  private newTransport() {
    return nodemailer.createTransport(smtp);
  }

  private async send(template: string, subject: string) {
    const html = pug.renderFile(`${__dirname}/views/${template}.pug`, {
      emailUser: this.emailUser,
      subject,
      url: this.url,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };

    const info = await this.newTransport().sendMail(mailOptions);
    if (ENV.debug === "development") {
      console.log(nodemailer.getTestMessageUrl(info));
    }
  }

  async sendVerificationCode() {
    await this.send("verificationCode", "Código de verificación de tu cuenta");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPassword",
      `Token de restablecimiento de contraseña (válido por ${
        ENV.tokenLifetime || ""
      })`
    );
  }
}
