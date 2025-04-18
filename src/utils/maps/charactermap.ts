import Config from "../../config/config";

const fs = require("fs");
const path = require("path");

const characterMapPath = path.join(
  __dirname,
  "../../public/json/charactermap.json"
);

let cached: ICharacter[] | undefined;

export function getEntry(
  key: keyof ICharacter,
  value: any
): ICharacter | undefined {
  const data = fs.readFileSync(characterMapPath, "utf8");
  const database = JSON.parse(data);

  for (const selector in database) {
    const entry = database[selector];

    if (entry[key] === value) {
      return entry;
    }
  }
  return undefined;
}

function get(): ICharacter[] {
  if (Config.Data.charactermap.keepInMemory) {
    if (cached) {
      return cached;
    }

    return (cached = loadFromDisk());
  }
  if (cached) {
    cached = undefined;
  }
  const data = fs.readFileSync(characterMapPath, "utf8");
  return JSON.parse(data);
}
function write(json: ICharacter[]) {
  if (cached) {
    if (!Config.Data.gadgetmap.keepInMemory) {
      cached = undefined;
    } else {
      cached = json;
    }
  }
  return fs.writeFileSync(characterMapPath, JSON.stringify(json, null, 4));
}
//IMPORTANT: ONLY CALL THIS FROM get();
function loadFromDisk() {
  const data = fs.readFileSync(characterMapPath, "utf8");
  return JSON.parse(data);
}
