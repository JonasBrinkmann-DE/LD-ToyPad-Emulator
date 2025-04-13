const fs = require("fs");
const path = require("path");

const characterMapPath = path.join(__dirname, "server/json/", "charactermap.json");

export function getCharacterNameFromID(id){
    const data = fs.readFileSync(characterMapPath, "utf8");
    const database = JSON.parse(data);

    for (const selector in database) {
      const entry = database[selector];

      if (entry.id === id) {
        return entry.name;
      }
    }
    return "N/A";
}