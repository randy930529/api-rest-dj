import * as bcrypt from "bcrypt";

export class PasswordHash {
  /**
   * @param password Plain password.
   * @returns Returns a hashed password.
   */
  public static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }

  public static async isPasswordValid(
    password: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
