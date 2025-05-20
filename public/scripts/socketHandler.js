import { RefreshToyBox } from "./api.js";
import { FadePad, GetGroupIndex, GetGroupMembers } from "./utils.js";

export const socket = io();

export function Register() {
  socket.on("refresh", function () {
    console.log("IO Recieved: Refresh Tokens");
    setTimeout(function () {
      RefreshToyBox();
    }, 1000);
  });

  socket.on("Fade One", function (e) {
    console.log("IO Recieved: Fade One");
    const group = e[0];
    const speed = e[1];
    const cycles = e[2];
    const color = e[3] + "80";
    const pads = GetGroupMembers(group);

    let padElement;
    pads.forEach((index) => {
      padElement = document.getElementById("toypad" + index);

      FadePad(padElement, color, speed, cycles);
    });
  });

  socket.on("Fade All", function (e) {
    console.log("IO Recieved: Fade All");
    const speed = e[0];
    const cycles = e[1];

    let pad;
    for (let i = 1; i <= 7; i++) {
      pad = document.getElementById("toypad" + i);

      const color = e[2 + 3 * GetGroupIndex(i)] + "80";

      FadePad(pad, color, speed, cycles);
    }
  });
  socket.on("Color One", function (e) {
    console.log("IO Recieved: Color One");
    const pad = e[0];
    const color = e[1] + "80";
    console.log(color);
    const pads = GetGroupMembers(pad);

    let padElement;
    pads.forEach((element) => {
      padElement = document.getElementById("toypad" + element);
      padElement.setAttribute("color", e[1]);
      padElement.style.backgroundColor = color;
    });
  });

  socket.on("Color All", function (e) {
    console.log("IO Recieved: Color All");
    for (let i = 1; i <= 7; i++) {
      const pad = document.getElementById("toypad" + i);

      if (!pad) continue;
      //const padnum = pad?.getAttribute("pad-num");
      const color = GetGroupIndex(i) + "80";

      pad.style.backgroundColor = color;
    }
  });

  socket.on("Connection True", function (e) {
    console.log("Connection Success Recieved");

    const statusOverlay = document.getElementById("status");

    if (!statusOverlay) return;
    statusOverlay.style.display = "none";
  });
}
function UnregisterAll() {
  socket.removeAllListeners();
}
