import * as nodemailer from "nodemailer";
import { User } from "../entity/User";
import { ENV } from "./settings/environment";
import * as pug from "pug";
import { convert } from "html-to-text";
import { Response } from "node-fetch";
import { Request } from "express";

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
    await this.send("verificationCode", "Your account verification code");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPassword",
      `Your password reset token (valid for only ${ENV.tokenLifetime})`
    );
  }

  /**
   * Para enviar por correo la response del TM
   */
  async sendTMResponseLog(response: Response, subject: string) {
    const { headers, body, status, timeout, url } = response;
    console.log(response);

    const mailOptions = {
      from: this.from,
      to: "randy.delgado@desoft.cu",
      subject,
      text: `STATUS: ${status}\n HEADERS: ${JSON.stringify(
        headers
      )}\n BODY: ${JSON.stringify(body)}\n TIME: ${timeout}\n URL: ${url}`,
    };

    const info1 = await this.newTransport().sendMail(mailOptions);
    mailOptions.to = "jose.lenzano@desoft.cu";
    const info2 = await this.newTransport().sendMail(mailOptions);

    if (ENV.debug === "development") {
      console.log(nodemailer.getTestMessageUrl(info1));
      console.log(nodemailer.getTestMessageUrl(info2));
    }
  }

  async sendTMRequestLog(response: Request, subject: string) {
    const { headers, body, statusCode = 200, url, params, query } = response;

    const mailOptions = {
      from: this.from,
      to: "randy.delgado@desoft.cu",
      subject,
      text: `STATUS:${statusCode}\n HEADERS: ${JSON.stringify(
        headers
      )}\n BODY: ${JSON.stringify(
        body
      )}\n URL: ${url}\n PARAMS: ${JSON.stringify(
        params
      )}\n QUERY: ${JSON.stringify(query)}`,
    };

    const info1 = await this.newTransport().sendMail(mailOptions);
    mailOptions.to = "jose.lenzano@desoft.cu";
    const info2 = await this.newTransport().sendMail(mailOptions);

    if (ENV.debug === "development") {
      console.log(nodemailer.getTestMessageUrl(info1));
      console.log(nodemailer.getTestMessageUrl(info2));
    }
  }
  /////////////////////////////////////////////////////////////////
}
