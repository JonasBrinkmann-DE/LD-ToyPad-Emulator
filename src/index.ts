import http from "http";
import app from "app";
import { backup, unplaceAll, validate } from "utils/toytags";
import { io, setIO, tp } from "bridge";
import { setupSocket } from "io";
import { hook } from "hooks";
import Emits from "enums/Emits";
import { loadConfig } from "Config";
import { IConfig } from "interfaces/IConfig";
import path from "path";

function init() {
  const config: IConfig = loadConfig();
  const port = config.port || 80;
  if (!validate()) {
    console.error("FATAL: Toytags.json does not contain valid JSON!");
    process.exit(1);
    return;
  }
  if (config.backupToytagsOnStart) {
    backup();
  }

  tp.registerDefaults();
  const server = http.createServer(app);
  const socket = setupSocket(server);

  setIO(socket);

  hook();

  InitializeToyTagsJSON();

  server.listen(port, () => console.log(`Server running on port ${port}`));
}

export function InitializeToyTagsJSON() {
  unplaceAll();
  console.log("Initialized toytags.JSON");
  io.emit(Emits.Refresh);
}
init();
