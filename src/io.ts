import { Socket } from "socket.io";
import { isConnectedToGame, tp } from "bridge";
import { deleteEntry, select, updateKey } from "utils/toytags";
import Emits from "enums/Emits";
import { Server } from "http";
import { createCharacter, createVehicle } from "./utils/tagUtils";
import { InitializeToyTagsJSON } from "index";

//TODO: Implement a feedback system for io requests
//If the server sends a negative feedback to the client, the client reverts the action on the ui
export function setupSocket(http: Server) {
  const io = require("socket.io")(http);
  io.on("connection", (socket: Socket) => {
    socket.on("deleteToken", (uid: string) => {
      console.log("IO Recieved: Deleting entry " + uid + " from JSON");
      deleteEntry("uid", uid);
      io.emit(Emits.Refresh);
    });
    socket.on("place", (uid: string, index: number, position: number) => {
      const entry = select("uid", uid);

      if (!entry) {
        return;
      }

      let token;
      if (entry.type === "character") {
        token = createCharacter(entry.id, uid);
      } else {
        if (!entry.vehicleUpgradesP23 || !entry.vehicleUpgradesP25) {
          return;
        }

        token = createVehicle(entry.id, uid, [
          entry.vehicleUpgradesP23,
          entry.vehicleUpgradesP25,
        ]);
      }

      tp.place(token, position, index, token.uid);
      updateKey(token.uid, "index", index);
    });

    socket.on("connectionStatus", () => {
      if (isConnectedToGame) {
        io.emit(Emits.ConnectionAffirmation);
      } else {
        io.emit(Emits.ConnectionDenial);
      }
    });

    socket.on("syncToyPad", () => {
      console.log("<<Syncing tags, one moment...>>");
      InitializeToyTagsJSON();
      let uid;
      for (let i = 1; i <= 7; i++) {
        uid = getUIDAtPad(i);
        if (uid != -1) {
          updateKey(uid, "index", i);
        }
      }
      io.emit(Emits.Refresh);
      console.log("<<Tags are synced!>>");
    });
  });
  return io;
}
function getUIDAtPad(index: number) {
  const token = tp._tokens.find((t: any) => t.index === index);
  return token ? token.uid : -1;
}
