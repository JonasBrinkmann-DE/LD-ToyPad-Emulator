import {
  CharacterName,
  CharacterSelect,
  CreationDialog,
  OpenCreationDialogButton,
  VehicleName,
  VehicleSelect,
} from "./dom.js";
import { ApplyFilters, ClearFilterInputs, ClearFilters } from "./filters.js";
import { Characters, Vehicles } from "./entry.js";
import { socket } from "./socketHandler.js";
import { FilterByName } from "./utils.js";
import { CreateCharacter, CreateVehicle } from "./api.js";

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
  socket?.emit("syncToyPad");
});
OpenCreationDialogButton?.addEventListener("click", () => {
  CreationDialog.showPopover();
  console.log("click!");
});

VehicleSelect?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = VehicleName?.value;
  const id = FilterByName(Vehicles, name).id;

  CreateVehicle(id).then(() => {
    VehicleSelect?.reset();
    socket?.emit("syncToyPad");
  });
});
CharacterSelect?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = CharacterName?.value;
  const id = FilterByName(Characters, name).id;

  CreateCharacter(id).then(() => {
    CharacterSelect?.reset();
    socket?.emit("syncToyPad");
  });
});
