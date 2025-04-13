const fs = require("fs");
const path = require("path");

const tokenMapPath = path.join(__dirname, "server/json/", "tokenmap.json");

export function getTokenNameFromID(id) {
  const data = fs.readFileSync(tokenMapPath, "utf8");
  const database = JSON.parse(data);

  for (const selector in database) {
    const entry = database[selector];

    if (entry.id === id) {
      return entry.name;
    }
  }
  return "N/A";
}