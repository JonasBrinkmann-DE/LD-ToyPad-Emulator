/*
	Copyright © 2023 Berny23, Cort1237 and many more

	This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/

const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const http = require("http");
const fs = require("fs");
//Setup Webserver
// deepcode ignore DisablePoweredBy: <please specify a reason of ignoring this>
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//File where tag info will be saved

const jsonFolder = path.join(__dirname, "server/json/");
const toytagsPath = path.join(jsonFolder, "toytags.json");
const tokenMapPath = path.join(jsonFolder, "tokenmap.json");
const characterMapPath = path.join(jsonFolder, "charactermap.json");

let wasConnectionEstablished = false;

initalizeToyTagsJSON(); //Run in case there were any leftovers from a previous run.
wasConnectionEstablished = true;
io.emit("Connection True");

//Create a token JSON object from provided vehicle data
/* Vehicle Data Explained:
 * All data is transfered through a series of buffers. The data from these buffers needs to written to specific points (pages) in the token's
 * buffer for it to be read properly.
 *
 * For vehicles:
 * Page 24 is the ID of the vehicle
 * Pages 23 & 25 are the upgrade data
 */

function createVehicle(id, upgrades, uid) {
  upgrades = upgrades || [0, 0];
  const token = Buffer.alloc(180);

  token.uid = uid;

  token.writeUInt32LE(upgrades[0], 0x23 * 4);
  token.writeUInt16LE(id, 0x24 * 4);
  token.writeUInt32LE(upgrades[1], 0x25 * 4);
  token.writeUInt16BE(1, 0x26 * 4); //Page 26 is used for verification of somekind.
  return token;
}

//Create a token JSON object from provided character data
function createCharacter(id, uid) {
  const token = Buffer.alloc(180);
  token.fill(0); // Game really only cares about 0x26 being 0 and D4 returning an ID
  token.uid = uid;
  token.id = id;
  return token;
}

//This finds a character or vehicles name from the ID provided.

function getCharacterNameFromID(id) {
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
function getTokenNameFromID(id) {
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
function getNameFromID(id) {
  if (id < 1000) {
    return getCharacterNameFromID(id);
  }
  return getTokenNameFromID(id);
}

//Finds and returns json entry from toytags.json by uid
function getToytagFromUID(uid) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const database = JSON.parse(data);

  for (const selector in database) {
    const entry = database[selector];

    if (entry.uid === uid) {
      return entry;
    }
  }
  return null;
}

//Updates the pad index of a tag in toytags.json, so that info can be accessed locally.
function updatePadIndex(uid, index) {
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

//Searches toytags.json and returns to UID of the entry with the matching index.
function getToytagUIDFromIndex(index) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const database = JSON.parse(data);

  for (const selector in database) {
    const entry = database[selector];
    if (entry.index === index) {
      return entry.uid;
    }
  }
  return "N/A";
}

//Updates the provided datatype, of the entry with the matching uid, with the provided data.
function writeJSONData(uid, datatype, data) {
  console.log("Planning to set " + datatype + " of " + uid + " to " + data);
  const tags = fs.readFileSync(toytagsPath, "utf8");
  const databases = JSON.parse(tags);
  for (const selector in database) {
    if (database[selector].index === index) {
      database[selector][datatype] = data;
      break;
    }
  }

  fs.writeFileSync(toytagsPath, JSON.stringify(databases, null, 4), (err) => {
    if (err) {
      console.warn(`Could not update entry because uid is invalid! [${uid}]!`);
      return false;
    }
    console.log(
      `Successfully updated [${datatype}] of entry [${uid}] to [${data}]!`
    );
    return true;
  });
}

//Unplaces all tags by updating their indexes to -1
function initalizeToyTagsJSON() {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const databases = JSON.parse(data);
  databases.forEach((db) => {
    db.index = "-1";
  });

  fs.writeFileSync(toytagsPath, JSON.stringify(databases, null, 4), (err) => {
    if (err) {
      console.error("Failed to write initalized data to toytags.json", err);
      return;
    }

    io.emit("refreshTokens");
  });
}

//TODO: Locate keystone (too many possible values to find by hand. need help here)
function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  let hex = `#${r}${g}${b}`;

  //Note: I removed comments when I orginized this, this should be documented in an external document.
  switch (hex) {
    case "#ff6e18":
    case "#f06716":
    case "#99420e":
      hex = "#ffffff";
      break;
    case "#ff0000":
      break;
    case "#ff6e00":
      hex = "#ffff00";
      break;
    case "#003700":
    case "#006700":
    case "#006e00":
      hex = "#00ff00";
      break;
    case "#006e18":
      hex = "#00ffff";
      break;
    case "#000016":
    case "#000018":
      hex = "#0000ff";
      break;
    case "#ff0018":
      hex = "#ff00ff";
      break;
    case "#f00016":
      hex = "#ff2de6";
      break;
    case "#002007":
      hex = "#007575";
      break;
    case "#4c2000":
      hex = "#757500";
      break;
    case "#4c0007":
      hex = "#750075";
      break;
    case "#3f1b05":
      hex = "#b0b0b0";
      break;
    case "#4c2007":
      hex = "#757575";
      break;
    case "#3f1b00":
      hex = "#b0b000";
      break;
    case "#3f0000":
      hex = "#b00000";
      break;
    case "#000005":
      hex = "#0000b0";
      break;
    case "#001b00":
      hex = "#00b000";
      break;
    case "#ff2700":
      hex = "#ffa200";
      break;
    case "#3f0900":
      hex = "#b06f00";
      break;
    case "#44000d":
      hex = "#d500ff";
      break;
    case "#110003":
      hex = "#9300b0";
      break;
    default:
      break;
  }

  return hex;
}

function getUIDAtPad(index) {
  return -1;
}

//When the game calls 'CMD_WRITE', writes the given data to the toytag in the top position.
/* Writing Tags Explained:
 * A write occurs in three seperate function calls, and will repreat until either the write is canceled in game,
 * or all three calls successfully write data.
 *
 * To appease the game all data is passed through and copied to the token in the top pad. But during this we can intercept what is being written
 * and save the data locally as well. This lets us call that data back when we want to use that tag again.
 *
 * payload[1] tells what page is being written, and everything after is the data.
 * page 24 - ID
 * page 23 - Vehicle Upgrade Pt 1
 * page 26 - Vehicle Upgrades Pt 2
 * **When writing the pages requested for the write are sometimes ofset by 12, not sure why.
 *
 * This data is copied to the JSON for future use.
 */
// file deepcode ignore NoRateLimitingForExpensiveWebOperation: <please specify a reason of ignoring this>

app.use(express.json());
app.use(express.static("server"));
//**Website requests**//
app.get(["/", "/:fileName"], (req, res) => {
  const fileName = req.params?.fileName || "index.html";

  const serverPath = path.resolve(__dirname, "server");
  const filePath = path.resolve(serverPath, fileName);

  if (!filePath.startsWith(serverPath)) {
    return res.status(400).end();
  }

  if (!fs.existsSync(filePath)) {
    Console.warn("Client requested non-existing ressource! " + filePath);
    res.status(404).end();
    return;
  }

  res.sendFile(filePath, (error) => {
    if (error) {
      console.log(error);
      res.sendFile(path.join(serverPath, "404.html"), (error) => {
        res.status(500).end();
      });
    }
  });
});

//Create a new Character and save that data to toytags.json
app.post("/character", (request, response) => {
  console.log("Creating character: " + request.body.id);
  const uid = "sexy";
  const character = createCharacter(request.body.id, uid);
  const name = getNameFromID(request.body.id);

  console.log(
    "name: " + name,
    " uid: " + character.uid,
    " id: " + character.id
  );

  fs.readFile(toytagsPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const tags = JSON.parse(data.toString());

      tags.push({
        name: name,
        id: character.id,
        uid: character.uid,
        index: "-1",
        type: "character",
        vehicleUpgradesP23: 0,
        vehicleUpgradesP25: 0,
      });

      fs.writeFile(
        toytagsPath,
        JSON.stringify(tags, null, 4),
        "utf8",
        (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          } else {
            console.log(`File is written successfully!`);
          }
        }
      );
    }
  });

  console.log("Character created: " + request.body.id);
  response.send();
});

//This is called when a token is placed or move onto a position on the toypad.
app.post("/characterPlace", (request, response) => {
  console.log("Placing tag: " + request.body.id);
  const entry = getToytagFromUID(request.body.uid);

  //console.log(entry.type);

  if (entry.type == "character") {
    const character = createCharacter(request.body.id, request.body.uid);
    console.log("Character tag: " + request.body.id);
    updatePadIndex(character.uid, request.body.index);
    response.send();
  } else {
    const vehicle = createVehicle(
      request.body.id,
      [entry.vehicleUpgradesP23, entry.vehicleUpgradesP25],
      request.body.uid
    );
    console.log("Vehicle tag: " + request.body.id);
    updatePadIndex(vehicle.uid, request.body.index);
    response.send();
  }
});

app.post("/vehicle", (request, response) => {
  console.log("Creating vehicle: " + request.body.id);
  const uid = "bitch";
  const vehicle = createVehicle(request.body.id, [0xefffffff, 0xefffffff], uid);
  const name = getNameFromID(request.body.id);

  console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);

  fs.readFile(toytagsPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const tags = JSON.parse(data.toString());
      const entry = {
        name: name,
        id: request.body.id,
        uid: vehicle.uid,
        index: "-1",
        type: "vehicle",
        vehicleUpgradesP23: 0xefffffff,
        vehicleUpgradesP25: 0xefffffff,
      };

      console.log(entry);
      tags.push(entry);

      fs.writeFile(
        toytagsPath,
        JSON.stringify(tags, null, 4),
        "utf8",
        (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          } else {
            console.log(`File is written successfully!`);
          }
        }
      );
    }
  });
  console.log("Vehicle placed: " + request.body.id);
  response.send(uid);
});

//This is called when a token needs to be removed from the pad.
app.delete("/remove", (request, response) => {
  console.log("Removing item: " + request.body.index);
  // console.log('DEBUG: pad-from-token: ', tp._tokens.filter(v => v.index == request.body.index)[0].pad);
  console.log("Item removed: " + request.body.index);
  updatePadIndex(request.body.uid, "-1");
  response.send(true);
});

//**IO CALLS**//
//This setups the IO connection between index.js and index.html.
io.on("connection", (socket) => {
  //Listening for 'deleteToken' call from index.html
  socket.on("deleteToken", (uid) => {
    console.log("IO Recieved: Deleting entry " + uid + " from JSON");
    const tags = fs.readFileSync(toytagsPath, "utf8");
    const databases = JSON.parse(tags);
    const index = -1;
    let i = 0;
    databases.forEach((db) => {
      if (uid == db.uid) {
        index = i;
        return;
      }
      i++;
    });
    console.log("Entry to delete: ", index);
    if (index > -1) {
      databases.splice(index, 1);
    }
    fs.writeFileSync(
      toytagsPath,
      JSON.stringify(databases, null, 4),
      function () {
        if (index > -1) console.log("Token not found");
        else console.log("Deleted ", uid, " from JSON");
      }
    );
    io.emit("refreshTokens");
  });

  socket.on("connectionStatus", () => {
    if (wasConnectionEstablished == true) {
      io.emit("Connection True");
    }
  });

  socket.on("syncToyPad", (pad) => {
    console.log("<<Syncing tags, one moment...>>");
    initalizeToyTagsJSON();
    for (let i = 1; i <= 7; i++) {
      uid = getUIDAtPad(i);
      if (uid != -1) {
        //console.log(uid, "is at pad #", i);
        writeJSONData(uid, "index", i);
      }
    }
    io.emit("refreshTokens");
    console.log("<<Tags are synced!>>");
  });
});

server.listen(80, () => {
  if (DEVELOPMENT) {
    console.log("Server is live on port 80 [http://localhost:80/]");
    return;
  }
  console.log("Server is running on port 80!");
});

let DEVELOPMENT = false;
process.argv.forEach((val, index, array) => {
  if (array.length >= 3) {
    if (array[2] == "-dev") {
      console.log("[DEVELOPMENT] Development mode enabled!");
      DEVELOPMENT = true;
    }
  }
});
