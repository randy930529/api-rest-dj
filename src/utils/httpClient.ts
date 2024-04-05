import fetch from "node-fetch";
import * as https from "https";
import { ENV } from "./settings/environment";

export default async function get(
  path: URL,
  config?: { method: string; [key: string]: unknown }
) {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  if (ENV.debug !== "development") config.agent = httpsAgent;

  return await fetch(path, config);
}
