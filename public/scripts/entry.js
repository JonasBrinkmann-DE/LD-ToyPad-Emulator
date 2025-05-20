import { Register as RegisterIOEvents, socket } from "./socketHandler.js";
import { CreateItemHtml, ToyboxTokens } from "./dom.js";
import { LoadCharactermap, LoadTokenmap } from "./utils.js";
import { SetupFilterInputs } from "./filters.js";

export const MousePosition = { x: -1, y: -1 };
export const Characters = await LoadCharactermap();
export const Vehicles = await LoadTokenmap();

function init() {
  document.addEventListener("mousemove", (e) => {
    MousePosition.x = e.pageX;
    MousePosition.y = e.pageY;
  });
  socket.emit("connectionStatus");
  socket.emit("syncToyPad");
}
function createTestingData(count) {
  for (let i = 0; i < count; i++) {
    ToyboxTokens?.insertAdjacentHTML(
      "beforeend",
      CreateItemHtml({
        name: "testing",
        uid: "012345678900000",
        id: i + 1,
        type: "character",
      })
    );
  }
}

SetupFilterInputs();
RegisterIOEvents();

createTestingData(5);
init();
