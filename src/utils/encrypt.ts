import * as crypto from "crypto";

export default function generateBase64String(data: string): string {
  const sha512 = crypto.createHash("sha512");
  const hashedData = sha512.update(data).digest("hex");
  const base64String = Buffer.from(hashedData, "hex").toString("base64");

  return base64String;
}
