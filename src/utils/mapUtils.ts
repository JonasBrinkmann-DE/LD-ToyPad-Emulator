import * as Tokenmap from "../utils/tokenmap.js";
import * as Charactermap from "../utils/charactermap.js";

export function getNameFromID(id) {
  if (id < 1000) {
    return Charactermap.getCharacterNameFromID(id);
  }
  return Tokenmap.getTokenNameFromID(id);
}
