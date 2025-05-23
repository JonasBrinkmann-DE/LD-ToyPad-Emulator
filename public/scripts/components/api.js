import { CreateItemHtml, ToyboxTokens } from "./dom.js";
import { ApplyFilters as ApplyFilters } from "./filters.js";
import { socket } from "./socketHandler.js";
import { DownloadToytags } from "./utils.js";

export function UpdateToyPadPosition(uid, position, index) {
  //DRAFT: socket?.emit("move", uid); //TODO: On server side, make sure UID is unique when generated

  RemoveToken(uid).then(() => {
    Place(uid, index, position);
  });
}
export function Place(uid, index, position) {
  socket?.emit("place", uid, index, position);
}
export async function RemoveToken(uid) {
  return (await DELETE(`/tokens/${uid}`)).ok;
}
export async function CreateVehicle(id) {
  return (await POST("/tokens/vehicle", { id: id })).ok;
}
export async function CreateCharacter(id) {
  return (await POST("/tokens/character", { id: id })).ok;
}
export async function DoesFileExist(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.status !== 404;
  } catch {
    return false;
  }
}
export async function RefreshToyBox() {
  //Maybe check which tags can stay?
  const data = await DownloadToytags();

  const boxes = document.querySelectorAll(".box");

  boxes?.forEach(function (box) {
    while (box.lastChild) {
      box.removeChild(box.lastChild);
    }
  });

  data?.forEach(async (tag) => {
    console.log(`ID: ${tag.id} UID: ${tag.uid}`);

    if (tag.index === -1) {
      if (tag.name !== "N/A") {
        ToyboxTokens?.insertAdjacentHTML(
          "beforeend",
          await CreateItemHtml(tag)
        );
      }
    } else {
      const pad = document.getElementById(`toypad${tag.index}`);

      pad?.insertAdjacentHTML("beforeend", await CreateItemHtml(tag));
    }

    ApplyFilters();
  });
}

async function POST(url, data) {
  if (typeof data === "object") {
    data = JSON.stringify(data);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  return res;
}
async function DELETE(url) {
  const res = await fetch(url, {
    method: "DELETE",
  });
  return res;
}
