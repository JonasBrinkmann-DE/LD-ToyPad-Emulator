import { Router, Request, Response } from "express";
import Global from "../global";
import { createVehicle, createCharacter } from "../utils/tagUtils";
import * as Toytags from "../utils/toytags";

const router = Router();
const tp = Global.getInstance().tp;

router.post("/", (req: Request, res: Response) => {
  console.log("Placing tag: " + req.body.id);
  const entry = Toytags.getFromUID(req.body.uid);

  if (entry.type == "character") {
    const character = createCharacter(req.body.id, req.body.uid);
    tp.place(character, req.body.position, req.body.index, character.uid);
    console.log("Character tag: " + req.body.id);
    Toytags.updatePadIndex(character.uid, req.body.index);
    res.send();
  } else {
    const vehicle = createVehicle(
      req.body.id,
      [entry.vehicleUpgradesP23, entry.vehicleUpgradesP25],
      req.body.uid
    );
    tp.place(vehicle, req.body.position, req.body.index, vehicle.uid);
    console.log("Vehicle tag: " + req.body.id);
    Toytags.updatePadIndex(vehicle.uid, req.body.index);
    res.send();
  }
});
export { router as placeRouter };
