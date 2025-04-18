import Config from "../../config/config";

const fs = require("fs");
const path = require("path");
const gadgetMapPath = path.join(__dirname, "../../public/json/gadgetmap.json");

let cached: IGadget[] | undefined;

export function getEntry(key: keyof IGadget, value: any) {
  const database = get();

  for (const selector in database) {
    const entry = database[selector];

    if (entry[key] === value) {
      return entry;
    }
  }
  return undefined;
}

function get(): IGadget[] {
  if (Config.Data.gadgetmap.keepInMemory) {
    if (cached) {
      return cached;
    }

    return (cached = loadFromDisk());
  }
  if (cached) {
    cached = undefined;
  }
  return loadFromDisk();
}

//IMPORTANT: ONLY CALL THIS FROM get();
function loadFromDisk() {
  const data = fs.readFileSync(gadgetMapPath, "utf8");
  return JSON.parse(data);
}
function write(json: IGadget[]) {
  if (cached) {
    if (!Config.Data.gadgetmap.keepInMemory) {
      cached = undefined;
    } else {
      cached = json;
    }
  }
  return fs.writeFileSync(gadgetMapPath, JSON.stringify(json, null, 4));
}
