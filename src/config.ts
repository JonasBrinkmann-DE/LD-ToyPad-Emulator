import fs from "fs";
import path from "path";
export function loadConfig() {
  const data = fs.readFileSync(path.join(__dirname, "config.json"), "utf8");

  return JSON.parse(data);
}
