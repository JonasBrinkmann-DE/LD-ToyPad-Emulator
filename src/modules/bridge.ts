const ld = require("node-ld");

import { Server } from "http";
export const tp = new ld.ToyPadEmu();
export let io: Server;
export let isConnectedToGame = false;

export function setIO(server: Server) {
  io = server;
}
export function setConnectionStatus(status: boolean) {
  isConnectedToGame = status;
}
