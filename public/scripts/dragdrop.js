import { RefreshToyBox, UpdateToyPadPosition } from "./api.js";
import { MousePosition } from "./entry.js";
import { ApplyFilters } from "./filters.js";
import { socket } from "./socketHandler.js";

const DRAG_OFFSET_X = 20;
const DRAG_OFFSET_Y = 0;

const toyboxSortable = new Sortable(document.getElementById("toybox-tokens"), {
  group: {
    name: "shared",
  },
  animation: 150,
  scroll: true,
  scrollSensitivity: 40,
  scrollSpeed: 10,
  onStart: onSortStart,
  onStop: onSortStop,
  onSort: onSort,
  onReceive: onReceive,
});

function onSortStart(e) {
  // Store the starting pad number and index so we can determine when releasing the tag if it was released in the same space
  const closest = e.item.closest(".box");

  e.item.setAttribute("previous-pad-num", closest.getAttribute("pad-num"));
  e.item.setAttribute("previous-pad-index", closest.getAttribute("pad-index"));
}
function onSortStop(e) {
  var parentBox = e.item.closest(".box");
  var previousPadNum = e.item.attr("previous-pad-num");
  var newPadNum = parentBox.attr("pad-num");
  var previousPadIndex = e.item.attr("previous-pad-index");
  var newPadIndex = parentBox.attr("pad-index");

  // If moving to the same space on the Toy Pad, remove and place in the current space
  if (
    previousPadNum != -1 &&
    previousPadNum == newPadNum &&
    previousPadIndex == newPadIndex
  ) {
    UpdateToyPadPosition(
      e.item.getAttribute("data-uid"),
      newPadNum,
      newPadIndex
    );
  }

  e.item.removeAttribute("previous-pad-num");
  e.item.removeAttribute("previous-pad-index");

  ApplyFilters(); //Refilter in case anything was in the search bar.
}
function onSort(e) {
  e.item.style.left = MousePosition.x - DRAG_OFFSET_X;
  e.item.style.top = MousePosition.y - DRAG_OFFSET_Y;
  e.item.style.listStyleType = "none";
}
function onReceive(e) {
  const id = e.item.getAttribute("id");
  if (id == "remove-tokens") {
    socket?.emit("deleteToken", e.item.getAttribute("data-uid"));
    setTimeout(async function () {
      await RefreshToyBox();
    }, 500); //TODO: No artificial delay
  } else if (
    this.getAttribute("pad-num") == undefined ||
    (this.children("li").length > 1 && id != "toybox-tokens")
  ) {
    //$(ui.sender).sortable("cancel");
    return false;
  }

  //If moving to the Toy Pox, remove tag from the game.
  else if (id == "toybox-tokens") {
    const uid = e.item.attr("data-uid");
    const url = `/tokens/${uid}/place`;

    const padIndex = parseInt(e.sender.getAttribute("pad-index"));

    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        index: padIndex,
      }),
    });
  }
  //If moving from the Toy Box, place tag in the game.
  else if (e.sender.attr("pad-num") == -1) {
    //event.sender.sortable("cancel");

    const uid = e.item.getAttribute("data-uid");
    const position = this.attr("pad-num");
    const index = this.attr("pad-index");
    const id = e.item.attr("data-id");

    socket.emit("place", uid, index, position);
    return false;
  }
  //If moving between spaces on the Toy Pad, remove from previous space and place in new one.
  else {
    UpdateToyPadPosition(
      e.item.getAttribute("data-uid"),
      this.getAttribute("pad-num"),
      this.getAttribute("pad-index")
    );
  }
}
