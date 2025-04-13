const fs = require("fs");
const path = require("path");

const toytagsPath = path.join(__dirname, "server/json/", "toytags.json");

export function initalize() {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const databases = JSON.parse(data);
  databases.forEach((db) => {
    db.index = "-1"; //TODO: PadIndex should be stored as indexes an not string. This is a both CLIENT and SERVER side change
  });

  try {
    fs.writeFileSync(toytagsPath, JSON.stringify(databases, null, 4), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to write initalized data to toytags.json", err);
    return false;
  }
}

export function updatePadIndex(uid, index) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const database = JSON.parse(data);

  for (const selector in database) {
    if (database[selector].uid === uid) {
      database[selector].index = index;
      break;
    }
  }
  fs.writeFileSync(toytagsPath, JSON.stringify(database, null, 4), (err) => {
    if (err) {
      console.warn(`Failed to update pad index of [${uid}]!`);
      return;
    }
    console.log(`Successfully updated pad index of [${uid}]!`);
  });
}

export function addEntry(entry) {
  if (typeof entry !== "object") return;

  const data = fs.readFileSync(toytagsPath, "utf8");
  const tags = JSON.parse(data);
  tags.push(entry);

  try {
    fs.writeFileSync(toytagsPath, JSON.stringify(tags, null, 4), "utf8");
    return true;
  } catch {
    return false;
  }
}
export function deleteEntry(key, value) {
  const tags = getJSON();

  for (let i = 0; i < tags.length; i++) {
    if (tags[i][key] == value) {
      tags.splice(i, 1);

      fs.writeFileSync(toytagsPath, JSON.stringify(tags, null, 4), "utf8");
      return true;
    }
  }
  return false;
}

export function getFromUID(uid) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const database = JSON.parse(data);

  for (const key in database) {
    const entry = database[key];

    if (entry.uid === uid) {
      return entry;
    }
  }
  return null;
}

export function getUIDFromIndex(index) {
  const database = getJSON();

  for (const key in database) {
    const entry = database[key];
    if (entry.index === index) {
      return entry.uid;
    }
  }
  return "N/A";
}
export function updateData(uid, datatype, data) {
  const database = getJSON();

  let wasChangeMade = false;
  for (const key in database) {
    if (database[key].index === uid) {
      wasChangeMade = true;
      database[key][datatype] = data;
      break;
    }
  }

  if (!wasChangeMade) return;

  fs.writeFileSync(toytagsPath, JSON.stringify(database, null, 4), (err) => {
    if (err) {
      console.warn(
        `An error occurred while trying to update ${path.basename(
          toytagsPath
        )}!`
      );
      return false;
    }

    console.log(
      `Successfully updated [${datatype}] of entry [${uid}] to [${data}]!`
    );

    return true;
  });
}

function getJSON() {
  const data = fs.readFileSync(toytagsPath, "utf8");
  return JSON.parse(data);
}
