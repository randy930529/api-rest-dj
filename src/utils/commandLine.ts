import * as inquirer from "inquirer";
import * as Joi from "joi";
import * as pg from "pg";
import * as moment from "moment";
import { ENV } from "./settings/environment";
import { AnswerType } from "./definitions";
import { User, UserRole } from "../entity/User";
import { PasswordHash } from "../auth/security/passwordHash";

const { host, port, username: user, password, database } = ENV;
const pool = new pg.Pool({
  user,
  host,
  database,
  password,
  port: port || 5432,
});

const createUser = async (user: User) => {
  try {
    const { email, password, active, role } = user;
    const register_date = moment().toDate();
    let query = {
      text: `INSERT INTO "user"("email", "password", "active", "role", "register_date") VALUES($1, $2, $3, $4, $5)`,
      values: [email, password, active, role, register_date],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    const client = await pool.connect();
    const result = await client.query(query);
    query = {
      text: `SELECT "User"."id" AS "id", "User"."email" AS "email" FROM "user" "User" WHERE ( ("User"."email" = $1) ) AND ( "User"."email" IN ($1) )`,
      values: [email],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    const { rows } = await client.query(query);

    query = {
      text: `INSERT INTO "profile"("userId", "primary") VALUES($1, $2)`,
      values: [rows[0].id, true],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    await client.query(query);

    query = {
      text: `SELECT "Profile"."id" AS "id", "Profile"."userId" AS "user" FROM "profile" "Profile" WHERE ( ("Profile"."userId" = $1) ) AND ( "Profile"."userId" IN ($1) )`,
      values: [rows[0].id],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    const { rows: profile } = await client.query(query);
    const year = moment().year();

    query = {
      text: `INSERT INTO "fiscal_year"("profileId", "year") VALUES($1, $2)`,
      values: [profile[0].id, year],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    await client.query(query);

    query = {
      text: `INSERT INTO "license_user"("userId", "is_paid","licenseKey") VALUES($1, $2, $3)`,
      values: [rows[0].id, true, ""],
    };

    if (ENV.debug === "development") console.log("> query: ", query.text);

    await client.query(query);

    await client.release();
    await client.end();

    console.info("\n User create successfully.");
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let defaultPass = `Admin.${ENV.emailFrom}/1234`;
if (defaultPass.length > 30) defaultPass = "Admin:api@mygestor:1234**";

const userScheme = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "cu"] },
    })
    .error((err) => new Error("Email address invalidate."))
    .required(),
  password: Joi.string().min(6).required().max(30),
  repeatPassword: Joi.ref("password"),
}).with("email", "password");

const input = async () =>
  inquirer
    .prompt([
      /* Pass your questions in here */
      {
        name: "email",
        message: "Enter your email address:",
        default: `${ENV.emailFrom}`,
      },
      {
        type: "password",
        name: "password",
        message: "Enter your password:",
        default: defaultPass,
      },
      {
        type: "password",
        name: "repeatPassword",
        message: "Repeat your password, please:",
        default: defaultPass,
      },
    ])
    .then(async (answers: AnswerType) => {
      const { email, password, repeatPassword } = answers;

      try {
        await userScheme.validateAsync({ email, password, repeatPassword });

        const hashedPassword = await PasswordHash.hashPassword(password);
        const user = Object.assign(new User(), {
          email,
          password: hashedPassword,
          active: true,
          role: UserRole.ADMIN,
        });

        const res = await createUser(user);

        if (res) console.info("\nAdmin:", { email, password }, "\n");
      } catch (error) {
        console.error(error);
      }
    })
    .catch((error) => {
      console.info("Error:", error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });

(async function () {
  console.info("MyGestor API command line wizard.\n - Create administrator:");
  await input();
})();
