import {
  AbilityFilter,
  AbilityList,
  CharacterList,
  GetAllBoxes,
  GetAllFilterOption as GetAllFilterOptions,
  GetAllItems,
  NameFilter,
  VehicleList,
  WorldFilter,
  WorldList,
} from "./dom.js";
import { Characters, Vehicles } from "../app.js";
import { GetUniqueSortedValues } from "./utils.js";

const IGNORED_WORLDS = ["15", "16", "17", "18", "19", "20", "N/A", "Unknown"];

function collectWorlds(applyBlackList = true) {
  let worlds = [];

  worlds = worlds.concat(
    Characters.map(function (character) {
      return character.world;
    })
  );
  worlds = worlds.concat(
    Vehicles.map(function (vehicle) {
      return vehicle.world;
    })
  );
  worlds = GetUniqueSortedValues(worlds);

  if (!applyBlackList) {
    return worlds;
  }
  return worlds.filter(function (world) {
    return !IGNORED_WORLDS.includes(world);
  });
}
function collectAbilities() {
  let abilities = [];
  abilities = abilities.concat(
    Characters.map(function (character) {
      return character.abilities.split(",");
    })
  );
  abilities = abilities.concat(
    Vehicles.map(function (vehicle) {
      return vehicle.abilities.split(",");
    })
  );
  abilities = abilities.flat();
  abilities = GetUniqueSortedValues(abilities);

  return abilities;
}

export function ApplyFilters() {
  //ClearFilters();
  //ApplyNameFilter();
  //ApplyWorldFilter();
  //ApplyAbilityFilter();
}
export function ApplyWorldFilter() {
  const world = WorldFilter?.value;
  if (world != "") {
    const options = GetAllFilterOptions();
    options?.forEach((option) => {
      if (option.getAttribute("data-world") != world) {
        option.disabled = true;
      }
    });

    const items = GetAllItems();
    items?.forEach(function (item) {
      if (item.getAttribute("data-world") != world) {
        item.classList.add("filtered");
      }
    });
  }
}

export function ApplyAbilityFilter() {
  const ability = AbilityFilter?.value;
  if (ability !== "") {
    const options = GetAllFilterOptions();
    options?.forEach((option) => {
      if (
        !option.getAttribute("data-abilities")?.split(",").includes(ability)
      ) {
        option.disabled = true;
      }
    });

    const items = GetAllItems();

    items?.forEach((item) => {
      if (!item.getAttribute("data-abilities")?.split(",").includes(ability)) {
        item.classList.add("filtered");
      }
    });
  }
}

export function ClearFilterInputs() {
  if (WorldFilter) {
    WorldFilter.value = "";
  }
  if (AbilityFilter) {
    AbilityFilter.value = "";
  }
  if (NameFilter) {
    NameFilter.value = "";
  }
}

export function ClearFilters() {
  const options = GetAllFilterOptions();

  options?.forEach((option) => {
    option.disabled = false;
  });
  const items = GetAllItems();

  items?.forEach((item) => {
    item.classList.remove("filtered");
  });
}
function createSingleElement(item) {
  const option = document.createElement("option");

  option.value = item.name;
  option.setAttribute("data-world", item.world);
  option.setAttribute("data-abilities", item.abilities);

  return option;
}

export function SetupFilterInputs() {
  Characters?.forEach((item) => {
    if (item.name != "Unknown" || item.name.includes("(unreleased)")) {
      CharacterList?.appendChild(createSingleElement(item));
    }
  });

  Vehicles?.forEach((vehicles) => {
    if (vehicles.name != "Unknown")
      VehicleList?.appendChild(createSingleElement(vehicles));
  });

  const worlds = collectWorlds(true);

  worlds?.forEach((world) => {
    if (world != "Unknown") WorldList?.append('<option value="' + world + '">');
  });
  const abilities = collectAbilities();

  abilities?.forEach(function (ability) {
    if (ability != "Unknown")
      AbilityList?.append('<option value="' + ability + '">');
  });
}
//Filter the toybox to tags matching the current text of the search bar.
export function ApplyNameFilter() {
  const text = NameFilter?.value.toLowerCase();

  const items = GetAllItems();

  let name;
  items?.forEach((item) => {
    name = item.value.toLowerCase();
    if (!name.includes(text)) {
      item.classList.add("filtered");
    }
  });
}
const boxes = GetAllBoxes();

for (let i = 0; i < boxes.length; i++) {
  const box = boxes[i];

  box.style.userSelect = "none";
  box.style.webkitUserSelect = "none";
}
//When there is a change in the search bar
NameFilter?.addEventListener("input", ApplyFilters);
