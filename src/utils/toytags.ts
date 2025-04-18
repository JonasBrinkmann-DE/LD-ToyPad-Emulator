const fs = require("fs");
const path = require("path");

const toytagsPath = path.join(__dirname, "server/json/", "toytags.json");

export function initalize() {
  const database = get();
  database.forEach((entry: IToytag) => {
    entry.index = -1; //TODO: PadIndex should be stored as indexes an not string. This is a both CLIENT and SERVER side change
  });

  const result = write(database);

  if (!result) {
    console.error("[Toytags] Initialization failed, could not write to file!");
    return false;
  }
  return true;
}

export function updatePadIndex(uid: string, index: number) {
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

export function addEntry(entry: IToytag) {
  const tags = get();
  tags.push(entry);

  const result = write(tags);
  if (!result) {
    console.error("[Toytags] Adding entry failed, could not write to file!");
    return false;
  }
  return true;
}
export function deleteEntry(key: keyof IToytag, value: any) {
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

export function storeDataBundle(uid: string, bundle: Array<any>) {
  const database = get();

  for (const select in database) {
    if (database[select].uid === uid) {
      bundle.forEach((pack: { key: keyof IToytag; value: any }) => {
        (database[select][pack.key] as any) = pack.value;
      });
      write(database);
      return;
    }
  }
}
export function storeData(uid: string, key: keyof IToytag, value: any) {
  const database: IToytag[] = get();

  for (const entryKey in database) {
    if (database[entryKey].uid === uid) {
      (database[entryKey] as any)[key] = value; //TODO: Dont do this
      write(database);
      return;
    }
  }
}
export function storeUpgrade(uid: string, page: 25 | 23, value: any) {
  const database: IToytag[] = get();

  for (const entryKey in database) {
    const entry = database[entryKey] as any;
    if (entry.uid === uid) {
      //TODO: THis is janky wtf dont do this please
      if (page === 25) {
        entry.upgrades.page25 = value;
      } else {
        entry.upgrades.page23 = value;
      }

      write(database);
      return;
    }
  }
}
export function getEntry(key: keyof IToytag, value: any): IToytag | undefined {
  const database = get();

  for (const selector in database) {
    const entry = database[selector];
    if (entry[key] == value) {
      return entry;
    }
  }
  return undefined;
}
function get(): IToytag[] {
  const data = fs.readFileSync(toytagsPath, "utf8");
  return JSON.parse(data);
}
function write(json: object) {
  return fs.writeFileSync(
    toytagsPath,
    JSON.stringify(json, null, 4),
    (err: Error) => {
      if (err) {
        return false;
      }
      return true;
    }
  );
}
