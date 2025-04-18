import { Router, Request, Response } from "express";
import Global from "../global";
import { createVehicle, createCharacter } from "../utils/tagUtils";
import * as Toytags from "../utils/toytags";
import { StatusCodes } from "../../node_modules/http-status-codes/build/cjs/status-codes";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  console.log("Placing tag: " + req.body.id);
  const entry = Toytags.getEntry("uid", req.body.uid);

  if (!entry) {
    return;
  }
  if (entry.type == Tagtype.Character) {
    const character = createCharacter(req.body.id, req.body.uid);
    Global.emulator.tp.place(
      character,
      req.body.position,
      req.body.index,
      character.uid
    );
    Toytags.updatePadIndex(character.uid, req.body.index);
    res.status(StatusCodes.CREATED);
  } else {
    if (!entry.upgrades) {
      return;
    }

    const vehicle = createVehicle(
      req.body.id,
      [entry.upgrades.page23, entry.upgrades.page25],
      req.body.uid
    );
    Global.emulator.tp.place(
      vehicle,
      req.body.position,
      req.body.index,
      vehicle.uid
    );
    Toytags.updatePadIndex(vehicle.uid, req.body.index);
    res.status(StatusCodes.CREATED);
  }
});
export { router as placeRouter };
