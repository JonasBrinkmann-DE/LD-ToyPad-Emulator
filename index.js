/*
	Copyright © 2023 Berny23, Cort1237 and many more

	This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/

const { Server } = require("socket.io");
const express = require("express");
const ld = require("node-ld");
const path = require("path");
const http = require("http");
const fs = require("fs");

//Setup Webserver
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
  token = tp._tokens.find((t) => t.index == index);
  if (token != null) return token.uid;
  else return -1;
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
tp.hook(tp.CMD_WRITE, (req, res) => {
  const ind = req.payload[0];
  const page = req.payload[1];
  const data = req.payload.slice(2);
  const uid = getToytagUIDFromIndex("2");
  console.log("REQUEST (CMD_WRITE): index:", ind, "page", page, "data", data);

  //The ID is stored in page 24
  if (page == 24 || page == 36) {
    writeJSONData(uid, "id", data.readInt16LE(0));
    const name = getNameFromID(data.readInt16LE(0));
    writeJSONData(uid, "name", name);
    writeJSONData(uid, "type", "vehicle");
    //writeVehicleData(uid, "uid", tp.randomUID())
  }
  //Vehicle uprades are stored in Pages 23 & 25
  else if (page == 23 || page == 35)
    writeJSONData(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
  else if (page == 25 || page == 37) {
    writeJSONData(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
    io.emit("refreshTokens"); //Refreshes the html's tag gui.
  }

  res.payload = Buffer.from([0x00], "hex");
  const token = tp._tokens.find((t) => t.index == ind);
  if (token) {
    req.payload.copy(token.token, 4 * page, 2, 6);
  }
});

//Colors
tp.hook(tp.CMD_COL, (req, res) => {
  console.log("    => CMD_COL");
  console.log("    => pad:", req.payload[0]);
  console.log("    => red:", req.payload[1]);
  console.log("    => green:", req.payload[2]);
  console.log("    => blue:", req.payload[3]);
  const pad_number = req.payload[0];
  const pad_color = RGBToHex(req.payload[1], req.payload[2], req.payload[3]);
  if (pad_number == 0) io.emit("Color All", [pad_color, pad_color, pad_color]);
  else io.emit("Color One", [pad_number, pad_color]);
});

tp.hook(tp.CMD_FADE, (req, res) => {
  const pad_number = req.payload[0];
  const pad_speed = req.payload[1];
  const pad_cycles = req.payload[2];
  const pad_color = RGBToHex(req.payload[3], req.payload[4], req.payload[5]);
  io.emit("Fade One", [pad_number, pad_speed, pad_cycles, pad_color]);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FLASH, (req, res) => {
  console.log("    => CMD_FLASH");
  console.log("    => pad:", req.payload[0]);
  console.log("    => color duration:", req.payload[1]);
  console.log("    => white duration:", req.payload[2]);
  console.log("    => cycles:", req.payload[3]);
  console.log("    => red:", req.payload[4]);
  console.log("    => green:", req.payload[5]);
  console.log("    => blue:", req.payload[6]);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FADRD, (req, res) => {
  console.log("    => CMD_FADRD - pad:", req.payload[0]);
  console.log("    => speed:", req.payload[1]);
  console.log("    => cycles:", req.payload[2]);
});

tp.hook(tp.CMD_FADAL, (req, res) => {
  const top_pad_speed = req.payload[1];
  const top_pad_cycles = req.payload[2];
  const top_pad_color = RGBToHex(
    req.payload[3],
    req.payload[4],
    req.payload[5]
  );
  const left_pad_speed = req.payload[7];
  const left_pad_cycles = req.payload[8];
  const left_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );
  const right_pad_speed = req.payload[13];
  const right_pad_cycles = req.payload[14];
  const right_pad_color = RGBToHex(
    req.payload[15],
    req.payload[16],
    req.payload[17]
  );

  io.emit("Fade All", [
    top_pad_speed,
    top_pad_cycles,
    top_pad_color,
    left_pad_speed,
    left_pad_cycles,
    left_pad_color,
    right_pad_speed,
    right_pad_cycles,
    right_pad_color,
  ]);
  // setTimeout(function(){io.emit("Fade All",
  // 					[top_pad_speed, top_pad_cycles, 'white',
  // 					 left_pad_speed, left_pad_cycles, 'white',
  // 					 right_pad_speed, right_pad_cycles, 'white'])}, 2500);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FLSAL, (req, res) => {
  console.log("    => CMD_FLSAL - top pad color duration:", req.payload[1]);
  console.log("    => top pad white duration:", req.payload[2]);
  console.log("    => top pad cycles:", req.payload[3]);
  console.log("    => top pad red:", req.payload[4]);
  console.log("    => top pad green:", req.payload[5]);
  console.log("    => top pad blue:", req.payload[6]);
  console.log("    => left pad color duration:", req.payload[8]);
  console.log("    => left pad white duration:", req.payload[9]);
  console.log("    => left pad cycles:", req.payload[10]);
  console.log("    => left pad red:", req.payload[11]);
  console.log("    => left pad green:", req.payload[12]);
  console.log("    => left pad blue:", req.payload[13]);
  console.log("    => right pad color duration:", req.payload[15]);
  console.log("    => right pad white duration:", req.payload[16]);
  console.log("    => right pad cycles:", req.payload[17]);
  console.log("    => right pad red:", req.payload[18]);
  console.log("    => right pad green:", req.payload[19]);
  console.log("    => right pad blue:", req.payload[20]);
});

tp.hook(tp.CMD_COLALL, (req, res) => {
  console.log("    => CMD_COLAL");
  const top_pad_color = RGBToHex(
    req.payload[1],
    req.payload[2],
    req.payload[3]
  );
  const left_pad_color = RGBToHex(
    req.payload[5],
    req.payload[6],
    req.payload[7]
  );
  const right_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );

  io.emit("Color All", [top_pad_color, left_pad_color, right_pad_color]);
});

///DEBUG PURPOSES///
tp.hook(tp.CMD_GETCOL, (req, res) => {
  console.log("    => CMD_GETCOL");
  console.log("    => pad:", req.payload[0]);
});

tp.hook(tp.CMD_WAKE, (req, res) => {
  wasConnectionEstablished = true;
  io.emit("Connection True");
});

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
      res.sendFile(path.join(serverPath, "404.html"), (error) => {
        res.status(500).end();
      });
    }
  });
});

//Create a new Character and save that data to toytags.json
app.post("/character", (request, response) => {
  console.log("Creating character: " + request.body.id);
  const uid = tp.randomUID();
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
app.post("/place", (request, response) => {
  console.log("Placing tag: " + request.body.id);
  const entry = getToytagFromUID(request.body.uid);

  if (entry.type == "character") {
    const character = createCharacter(request.body.id, request.body.uid);
    tp.place(
      character,
      request.body.position,
      request.body.index,
      character.uid
    );
    console.log("Character tag: " + request.body.id);
    updatePadIndex(character.uid, request.body.index);
    response.send();
  } else {
    const vehicle = createVehicle(
      request.body.id,
      [entry.vehicleUpgradesP23, entry.vehicleUpgradesP25],
      request.body.uid
    );
    tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
    console.log("Vehicle tag: " + request.body.id);
    updatePadIndex(vehicle.uid, request.body.index);
    response.send();
  }
});

app.post("/vehicle", (request, response) => {
  console.log("Creating vehicle: " + request.body.id);
  const uid = tp.randomUID();
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
  tp.remove(request.body.index);
  console.log("Item removed: " + request.body.index);
  updatePadIndex(request.body.uid, "-1");
  response.send(true);
});

//**IO CALLS**//
//This setups the IO connection between index.js and index.html.
io.on("connection", (socket) => {
  //Listening for 'deleteToken' call from index.html
  socket.on("deleteToken", (uid) => {
    //TODO: Replace with express request
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
    //TODO: Replace with express request
    if (wasConnectionEstablished == true) {
      io.emit("Connection True");
    }
  });

  socket.on("syncToyPad", (pad) => {
    console.log("[SOCKET] Started syncing tags with client...");
    initalizeToyTagsJSON();
    for (let i = 1; i <= 7; i++) {
      uid = getUIDAtPad(i);
      if (uid != -1) {
        writeJSONData(uid, "index", i);
      }
    }
    io.emit("refreshTokens");
    console.log("[SOCKET] Successfully synced tags with client!");
  });
});

server.listen(80, () => {
  if (DEVELOPMENT) {
    console.log("Server is live on port 80 [http://localhost:80/]");
    return;
  }
  console.log("Server is running on port 80!");
});
