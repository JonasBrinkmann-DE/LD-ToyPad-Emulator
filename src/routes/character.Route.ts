import { Router, Request, Response } from "express";
import Global from "../global";
import { createCharacter } from "../utils/tagUtils";
import { getNameFromID } from "../utils/mapUtils";
import * as Toytags from "../utils/toytags";

const router = Router();
const tp = Global.getInstance().tp;

router.post("/", (req: Request, res: Response) => {
  console.log("Creating character: " + req.body.id);
  const uid = tp.randomUID();
  const character = createCharacter(req.body.id, uid);
  const name = getNameFromID(req.body.id);

  const entry = {
    name: name,
    id: character.id,
    uid: character.uid,
    index: "-1",
    type: "character",
    vehicleUpgradesP23: 0,
    vehicleUpgradesP25: 0,
  };

  Toytags.addEntry(entry);

  console.log("Character created: " + req.body.id);
  res.send();
});
export { router as characterRouter };
