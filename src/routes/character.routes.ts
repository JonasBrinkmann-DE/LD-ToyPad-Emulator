import express, { Request, Response } from "express";
import { createCharacter, getCharacterNameFromID } from "../utils/tagUtils";
import { tp } from "../modules/bridge";
import { addEntry } from "../utils/toytags";
import { Toytag } from "../interfaces/Toytag";
import Tagtypes from "../enums/Tagtypes";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  const uid = tp.randomUID();
  const id = req.body.id;
  console.log("Creating character: " + id);
  const character = createCharacter(id, uid);
  const name = getCharacterNameFromID(id);

  console.log(
    "name: " + name,
    " uid: " + character.uid,
    " id: " + character.id
  );

  const entry: Toytag = {
    name: name,
    id: id,
    uid: character.uid,
    index: -1,
    type: Tagtypes.Character,
    vehicleUpgradesP23: 0,
    vehicleUpgradesP25: 0,
  };

  addEntry(entry);

  console.log("Character created: " + req.body.id);
  res.sendStatus(200);
});
export default router;
