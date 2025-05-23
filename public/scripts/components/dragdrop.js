import { Place, RefreshToyBox, UpdateToyPadPosition } from "./api.js";
import { DeleteBox, EditBox, ToyboxTokens } from "./dom.js";
import { MousePosition } from "../app.js";
import { ApplyFilters } from "./filters.js";
import { socket } from "./socketHandler.js";

const DRAG_OFFSET_X = 20;
const DRAG_OFFSET_Y = 0;

export function createSortables() {
  new Sortable(DeleteBox, {
    group: {
      name: "shared",
    },
    sort: false,
    onAdd: function (e) {
      const uid = e.item.getAttribute("uid");

      socket?.emit("deleteToken", uid);
      setTimeout(async function () {
        await RefreshToyBox();
      }, 500); //TODO: No artificial delay
    },
  });
  new Sortable(EditBox, {
    group: {
      name: "shared",
    },
    sort: false,
    onAdd: function (e) {
      //OPEN EDIT DIALOG
      e.from.insertBefore(e.item, e.from.children[e.oldIndex]);
    },
  });
  new Sortable(ToyboxTokens, {
    group: {
      name: "shared",
    },
    animation: 150,
    scroll: true,
    scrollSensitivity: 40,
    scrollSpeed: 10,
    onMove: onMove,
    onAdd: onDropToybox,
  });
  document.querySelectorAll("[pad-num]").forEach((element) => {
    const pad = element.getAttribute("pad-num");
    if (pad < 0) return;

    new Sortable(element, {
      group: {
        name: "shared",
      },
      animation: 150,
      scroll: true,
      scrollSensitivity: 40,
      scrollSpeed: 10,
      onMove: onMove,
      onAdd: onDropToypad,
    });
  });
}

function onDropToybox(e) {
  console.log("DROP TOYBOX");
  const uid = e.item.getAttribute("data-uid");
  const url = `/tokens/${uid}`;
  const parent = e.to;

  const padIndex = parseInt(parent.getAttribute("pad-index"));

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      index: padIndex,
    }),
  });
}
function onDropToypad(e) {
  const parent = e.to;
  const newPadNum = parent.getAttribute("pad-num");
  const newPadIndex = parent.getAttribute("pad-index");
  const uid = e.item.getAttribute("data-uid");
  UpdateToyPadPosition(uid, newPadNum, newPadIndex);

  ApplyFilters();
}
function onMove(e) {
  const target = e.to;

  const limit = target.getAttribute("max-items");

  if (!limit) {
    return true;
  }
  if (target.children.length >= parseInt(limit) && e.from !== target) {
    return false;
  }
}
