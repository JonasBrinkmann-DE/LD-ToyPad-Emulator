import { CreateItemHtml, ToyboxTokens } from "./dom.js";
import { ApplyFilters as ApplyFilters } from "./filters.js";
import { socket } from "./socketHandler.js";
import { DownloadToytags } from "./utils.js";

export function UpdateToyPadPosition(uid, position, newIndex) {
  //DRAFT: socket.emit("move", uid); //TODO: On server side, make sure UID is unique when generated

  const url = `/tokens/${uid}/place`;

  fetch(url, {
    method: "DELETE",
  }).then(() => {
    socket.emit("place", uid, newIndex, position);
  });
}

export function DoesFileExist(url) {
  try {
    const http = new XMLHttpRequest();
    http.open("HEAD", url, false);
    http.send();
    return http.status != 404;
  } catch {
    return false;
  }
}
export async function RefreshToyBox() {
  //Maybe check which tags can stay?
  //1. Download toytags
  //2. Delete old ones
  //3. Load new ones

  const data = await DownloadToytags();

  //Remove Old Tokens
  const boxes = document.querySelectorAll(".box");

  boxes.forEach(function (box) {
    while (
      box.lastChild &&
      box.lastChild.id !== "deleteToken" &&
      box.lastChild.id !== "colorToken"
    ) {
      box.removeChild(box.lastChild);
    }
  });

  //Add new ones
  data.forEach((tag) => {
    console.log(`ID: ${tag.id} UID: ${tag.uid}`);

    if (tag.index === -1) {
      if (tag.name !== "N/A") {
        ToyboxTokens?.insertAdjacentHTML("beforeend", CreateItemHtml(tag));
      }
    } else {
      const pad = document.getElementById(`toypad${tag.index}`);

      pad?.insertAdjacentHTML("beforeend", CreateItemHtml(tag));
    }

    ApplyFilters();
  });
}
