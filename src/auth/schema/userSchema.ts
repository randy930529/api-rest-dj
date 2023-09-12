import * as Joi from "joi";

var decimal =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,30}$/;

const userScheme = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "cu"] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp(decimal)).required(),
  repeatPassword: Joi.ref("password"),
  access_token: [Joi.string(), Joi.number()],
})
  .with("email", "password")
  .xor("password", "access_token");

export default userScheme;
