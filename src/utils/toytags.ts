import fs from "fs";
import path from "path";
import { Toytag } from "../interfaces/Toytag";

const toytagsPath = path.join("public/json/toytags.json");

//This updates the provided datatype, of the entry with the matching uid, with the provided data.
export function updateKey<K extends keyof Toytag>(
  uid: string,
  datatype: K,
  value: Toytag[K]
) {
  const data = get();

  let entry;
  for (let i = 0; i < data.length; i++) {
    entry = data[i];

    if (entry.uid == uid) {
      entry[datatype] = value;
      break;
    }
  }

  write(data);
}

export function updateKeys<K extends keyof Toytag>(
  uid: string,
  bundle: [K, Toytag[K]][]
) {
  const data = get();

  let entry: Toytag | undefined;
  for (let i = 0; i < data.length; i++) {
    if (data[i].uid === uid) {
      entry = data[i];
      break;
    }
  }

  if (!entry) return;

  bundle.forEach(([key, value]) => {
    entry[key] = value;
  });

  write(data);
}
export function addEntry(entry: Toytag) {
  if (typeof entry !== "object") return;

  const data = get();
  data.push(entry);

  write(data);
}
export function unplaceAll() {
  const data = get();

  data.forEach((entry: Toytag) => {
    entry.index = -1;
  });

  write(data);
}
export function deleteEntry(key: keyof Toytag, value: Toytag[keyof Toytag]) {
  const data = get();

  let wasDeleted = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i][key] === value) {
      data.splice(i, 1);
      wasDeleted = true;
      break;
    }
  }
  if (wasDeleted) {
    write(data);
    return true;
  }
  return false;
}
export function select(
  key: keyof Toytag,
  value: Toytag[keyof Toytag]
): Toytag | null {
  const data = get();

  for (let i = 0; i < data.length; i++) {
    if (data[i][key] === value) {
      return data[i];
    }
  }
  return null;
}
export function validate() {
  const raw = getRaw();

  try {
    JSON.parse(raw);
  } catch {
    return false;
  }
  return true;
}
export function backup() {
  const toytagsBackupPath = path.join("public/json/backup.toytags.json");
  fs.copyFileSync(toytagsPath, toytagsBackupPath);
}
//** Internal private calls */
function get(): Toytag[] {
  const rawData = fs.readFileSync(toytagsPath, "utf8");

  return JSON.parse(rawData);
}
function getRaw() {
  return fs.readFileSync(toytagsPath, "utf8");
}
function write(data: Toytag[] | string) {
  if (typeof data === "object") {
    data = JSON.stringify(data);
  }

  fs.writeFileSync(toytagsPath, data);
}
