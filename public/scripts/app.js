import { FadePad, LoadCharactermap, LoadTokenmap } from "./components/utils.js";
import {
  Register as RegisterIOEvents,
  socket,
} from "./components/socketHandler.js";
import { CreateItemHtml, ToyboxTokens } from "./components/dom.js";
import { SetupFilterInputs } from "./components/filters.js";
import { createSortables } from "./components/dragdrop.js";
export const MousePosition = { x: -1, y: -1 };
export const Characters = await LoadCharactermap();
export const Vehicles = await LoadTokenmap();

function init() {
  document.addEventListener("mousemove", (e) => {
    MousePosition.x = e.pageX;
    MousePosition.y = e.pageY;
  });

  createSortables();
  socket?.emit("connectionStatus");
  socket?.emit("syncToyPad");
}
async function createTestingData(char, veh) {
  for (let i = 0; i < char; i++) {
    ToyboxTokens?.insertAdjacentHTML(
      "beforeend",
      await CreateItemHtml({
        name: "testing",
        uid: "012345678900000",
        id: i + 1,
        type: "character",
      })
    );
  }
  for (let i = 0; i < veh; i++) {
    ToyboxTokens?.insertAdjacentHTML(
      "beforeend",
      await CreateItemHtml({
        name: "testing",
        uid: "012345678900000",
        id: i + 1000,
        type: "vehicle",
      })
    );
  }
}

SetupFilterInputs();
RegisterIOEvents();

createTestingData(5, 3);
init();
