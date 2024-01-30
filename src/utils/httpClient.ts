import fetch from "node-fetch";

export default async function get(
  path: URL,
  config?: { method: string; [key: string]: unknown }
) {
  return await fetch(path, config);
}
