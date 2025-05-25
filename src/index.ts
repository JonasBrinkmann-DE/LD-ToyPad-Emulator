import http from "http";
import app from "modules/app";
import { backup, unplaceAll, validate } from "utils/toytags";
import { io, setIO, tp } from "modules/bridge";
import { setupSocket } from "modules/io";
import { hook } from "modules/hooks";
import Emits from "enums/Emits";

function init() {
  if (!validate()) {
    console.error("FATAL: Toytags.json does not contain valid JSON!");
    process.exit(1);
    return;
  }
  backup();

  tp.registerDefaults();
  const server = http.createServer(app);
  const socket = setupSocket(server);

  setIO(socket);

  hook();

  InitializeToyTagsJSON();

  server.listen(80, () => console.log(`Server running on port 80`));
}

export function InitializeToyTagsJSON() {
  unplaceAll();
  console.log("Initialized toytags.JSON");
  io.emit(Emits.Refresh);
}
init();
