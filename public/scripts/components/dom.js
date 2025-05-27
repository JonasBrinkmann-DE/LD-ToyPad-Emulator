import { DoesFileExist } from "./api.js";
import { Characters, Vehicles } from "../app.js";
import { FilterById } from "./utils.js";

export const ToyboxTokens = document.getElementById("toybox-tokens");

export const AbilityFilter = document.getElementById("tag-ability-filter");
export const WorldFilter = document.getElementById("tag-world-filter");
export const NameFilter = document.getElementById("name-filter");

export const CharacterList = document.getElementById("character-list");
export const VehicleList = document.getElementById("vehicle-list");
export const AbilityList = document.getElementById("ability-list");
export const WorldList = document.getElementById("world-list");

export const CharacterSelect = document.getElementById("character-select");
export const VehicleSelect = document.getElementById("vehicle-select");

export const CharacterName = document.getElementById("character-name");
export const VehicleName = document.getElementById("vehicle-name");

export const OpenCreationDialogButton = document.getElementById(
  "open-creation-dialog"
);
export const CreationDialog = document.getElementById("creation-dialog");
export const EditDialog = document.getElementById("edit-dialog");

export const EditBox = document.getElementById("edit-action");
export const DeleteBox = document.getElementById("delete-action");

export const DialogShadow = document.getElementById("shadow");
export function GetAllBoxes() {
  return document.getElementsByClassName("box");
}

export function GetAllFilterOption() {
  return document.querySelectorAll(
    "#character-list option, #vehicle-list option"
  );
}
export function GetAllItems() {
  return document.querySelectorAll(".item");
}
export async function CreateItemHtml(item) {
  const itemData = FilterById(
    item.type == "character" ? Characters : Vehicles,
    item.id
  );

  let content = `<h3>${itemData.name}</h3>`;
  const path = "images/" + itemData.id;
  const url = location.href + "/../" + path;

  const doesFileExist = await DoesFileExist(url);
  if (doesFileExist) {
    content = `<img src="${path}" alt="${itemData.name}" class="preview">`;
  }

  return (
    "<li class=item data-name=" +
    item.name +
    " data-type=" +
    item.type +
    " data-id= " +
    item.id +
    " data-uid=" +
    item.uid +
    ' data-world="' +
    itemData.world +
    '" data-abilities="' +
    itemData.abilities +
    '">' +
    content +
    "</li>"
  );
}
