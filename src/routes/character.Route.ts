import { Router, Request, Response } from "express";
import Global from "../global";
import { createCharacter } from "../utils/tagUtils";
import { getNameFromID } from "../utils/mapUtils";
import * as Toytags from "../utils/toytags";
import { getEntry } from "../utils/maps/charactermap";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const id = req.body.id;
  const uid = Global.emulator.randomUID();
  const character = createCharacter(id, uid);
  const name = getEntry("id", id)?.name;

  if (!name) {
    return;
  }
  const entry: IToytag = {
    name: name,
    id: character.id,
    uid: character.uid,
    index: -1,
    type: Tagtype.Character,
  };

  Toytags.addEntry(entry);

  console.log("Character created: " + req.body.id);
  res.send();
});
export { router as characterRouter };
