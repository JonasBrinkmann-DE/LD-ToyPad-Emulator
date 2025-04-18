const fs = require("fs");
const path = require("path");

const toytagsPath = path.join(__dirname, "server/json/", "toytags.json");

export function initalize() {
  const database = get();
  database.forEach((entry) => {
    entry.index = "-1"; //TODO: PadIndex should be stored as indexes an not string. This is a both CLIENT and SERVER side change
  });

  const result = write(database);

  if (!result) {
    console.error("[Toytags] Initialization failed, could not write to file!");
    return false;
  }
  return true;
}

export function updatePadIndex(uid, index) {
  const database = getEntry("uid", uid);

  if (!database) {
    console.warn("[Toytags] Could not find tag when trying to update index!");
    return;
  }

  database.index = index;

  const result = write(database);
  if (!result) {
    console.error(
      "[Toytags] Updating pad index failed, could not write to file!"
    );
    return false;
  }
  return true;
}

export function addEntry(entry: object) {
  const tags = get();
  tags.push(entry);

  const result = write(tags);
  if (!result) {
    console.error("[Toytags] Adding entry failed, could not write to file!");
    return false;
  }
  return true;
}
export function deleteEntry(key, value) {
  const tags = get();

  for (let i = 0; i < tags.length; i++) {
    if (tags[i][key] == value) {
      tags.splice(i, 1);

      const result = write(tags);
      if (!result) {
        console.error(
          "[Toytags] Removing entry failed, could not write to file!"
        );
        return false;
      }
      return true;
    }
  }
  return false;
}

export function storeDataBundle(uid, bundle: Array<any>) {
  const database = get();

  for (const select in database) {
    if (database[select].uid === uid) {
      bundle.forEach((pack) => {
        database[select][pack.key] = pack.value;
      });
      write(database);
      return;
    }
  }
}
export function storeData(uid, key, value) {
  const database = get();

  let wasChangeMade = false;
  for (const select in database) {
    if (database[select].uid === uid) {
      database[select][key] = value;
      write(database);
      return;
    }
  }
}

export function getEntry(key: keyof IToytag, value): IToytag | undefined {
  const database = get();

  for (const key in database) {
    const entry = database[key];
    if (entry[key] === value) {
      return entry;
    }
  }
  return undefined;
}
function get() {
  const data = fs.readFileSync(toytagsPath, "utf8");
  return JSON.parse(data);
}
function write(json: object) {
  return fs.writeFileSync(toytagsPath, JSON.stringify(json, null, 4), (err) => {
    if (err) {
      return false;
    }
    return true;
  });
}
