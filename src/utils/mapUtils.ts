import * as Vehiclemap from "./maps/vehiclemap";
import * as Charactermap from "./maps/charactermap";
import * as Gadgetmap from "./maps/gadgetmap";
//TODO: Find a way to not use thie function
export function getNameFromID(id) {
  if (id < 1000) {
    let data = Gadgetmap.getEntry("id", id); //Seachring Gadgetmap first because it's smaller

    if (!data) {
      data = Charactermap.getEntry("id", id);
    }
    return data.name;
  }
  return Vehiclemap.getEntry("id", id);
}
