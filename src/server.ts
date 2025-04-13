import * as Toytags from "./utils/toytags";
import Global from "./global";
import WriteHook from "./hooks/writeHook";
import ColorHook from "./hooks/colorHook";
import FadeHook from "./hooks/fadeHook";
import FlashHook from "./hooks/flashHook";
import FadrdHook from "./hooks/fadrdHook";
import FadeAllHook from "./hooks/fadeAllHook";
import FlashAllHook from "./hooks/flashAllHook";
import ColorAllHook from "./hooks/colorAllHook";
import GetColorHook from "./hooks/getColorHook";
import WakeHook from "./hooks/wakeHook";
import Events from "./socket/events";
import Config from "./config/config";

const { Server } = require("socket.io");
const ld = require("node-ld");
const app = require("./app");
const http = require("http");

Config.Reload();

Global.emulator = new ld.ToypadEmu();

const server = http.createServer(app);
Global.io = new Server(server);
//Run in case there were any leftovers from a previous run.
if (Toytags.initalize()) {
  Global.io.emit("refreshTokens");
}

///Implemented///
Global.emulator.hook(Global.emulator.CMD_WRITE, WriteHook.handle);
Global.emulator.hook(Global.emulator.CMD_COL, ColorHook.handle);
Global.emulator.hook(Global.emulator.CMD_FADE, FadeHook.handle);
Global.emulator.hook(Global.emulator.CMD_FADAL, FadeAllHook.handle);
Global.emulator.hook(Global.emulator.CMD_COLALL, ColorAllHook.handle);
Global.emulator.hook(Global.emulator.CMD_WAKE, WakeHook.handle);

///NOT IMPLEMENTED///
Global.emulator.hook(Global.emulator.CMD_FLASH, FlashHook.handle);
Global.emulator.hook(Global.emulator.CMD_FADRD, FadrdHook.handle);
Global.emulator.hook(Global.emulator.CMD_FLSAL, FlashAllHook.handle);

///DEBUG PURPOSES///
Global.emulator.hook(Global.emulator.CMD_GETCOL, GetColorHook.handle);

//This is called when a token needs to be removed from the pad.

//**IO CALLS**//
//This setups the IO connection between index.js and index.html.
Global.io.on("connection", (socket) => {
  Events.initalize(socket);
});

server.listen(Config.Port, () => {
  console.log(`Server is running on port ${Config.Port}!`);
});
