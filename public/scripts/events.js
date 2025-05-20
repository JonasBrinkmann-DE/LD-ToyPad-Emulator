import {
  CharacterName,
  CharacterSelect,
  VehicleName,
  VehicleSelect,
} from "./dom.js";
import { ApplyFilters, ClearFilterInputs, ClearFilters } from "./filters.js";
import { Characters, Vehicles } from "./entry.js";
import { socket } from "./socketHandler.js";
import { FilterByName } from "./utils.js";

const filterInput = document.querySelector(".filter-input");
const worldFilter = document.querySelector("#tag-world-filter");
const abilityFilter = document.querySelector("#tag-ability-filter");
const clearFilterButton = document.querySelector("#clear=filters");
filterInput?.addEventListener("change", ApplyFilters);

worldFilter?.addEventListener("click", OnFilterClick);
abilityFilter?.addEventListener("click", OnFilterClick);
clearFilterButton?.addEventListener("click", OnClearFiltersClick);
function OnClearFiltersClick() {
  ClearFilterInputs();
  ClearFilters();
}
function OnFilterClick() {
  this.value = "";
  ApplyFilters();
}
const syncButton = document.querySelector("#sync");
syncButton?.addEventListener("click", () => {
  socket.emit("syncToyPad");
});

VehicleSelect?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = VehicleName?.value;
  const id = FilterByName(Vehicles, name).id;
  fetch("/tokens/vehicle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  }).then(() => {
    VehicleSelect?.reset();
    socket.emit("syncToyPad");
  });
});
CharacterSelect?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = CharacterName?.value;
  fetch("/tokens/character", {
    method: "POST",
    body: JSON.stringify({ id: FilterByName(Characters, name).id }),
  }).then(() => {
    setTimeout(() => {
      socket.emit("syncToyPad");
      CharacterSelect?.reset();
    }, 150);
  });
});
