import fetch from "node-fetch";
import * as https from "https";
import { ENV } from "./settings/environment";

let retryCount = 0;

export default async function get(
  path: URL,
  config?: { method: string; [key: string]: unknown }
) {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  if (ENV.debug !== "development") config.agent = httpsAgent;

  return await fetch(path, config)
    .then(async (res) => {
      retryCount++;
      const body = await res.json();
      if (!body.Success && retryCount <= 3) {
        return await get(path, config);
      }

      retryCount = 0;
      return body;
    })
    .catch(async (err) => {
      retryCount++;
      if (retryCount <= 3) {
        return await get(path, config);
      } else {
        retryCount = 0;
        throw err;
      }
    });
}
