import Config from "../../config/config";

const fs = require("fs");
const path = require("path");

const vehicleMapPath = path.join(
  __dirname,
  "../../public/json/json/vehiclemap.json"
);

let cached: IVehicle[] | undefined;

export function getEntry(key: keyof IVehicle, value: any) {
  const database = get();

  for (const selector in database) {
    const entry = database[selector];

    if (entry[key] === value) {
      return entry;
    }
  }
  return undefined;
}

function get(): IVehicle[] {
  if (Config.Data.vehiclemap.keepInMemory) {
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
function write(json: IVehicle[]) {
  if (cached) {
    if (!Config.Data.gadgetmap.keepInMemory) {
      cached = undefined;
    } else {
      cached = json;
    }
  }
  return fs.writeFileSync(vehicleMapPath, JSON.stringify(json, null, 4));
}
//IMPORTANT: ONLY CALL THIS FROM get();
function loadFromDisk() {
  const data = fs.readFileSync(vehicleMapPath, "utf8");
  return JSON.parse(data);
}
