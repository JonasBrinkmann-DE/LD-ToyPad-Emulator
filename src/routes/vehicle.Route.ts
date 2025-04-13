import { Router, Request, Response } from "express";
import { createVehicle } from "../utils/tagUtils";
import { getNameFromID } from "../utils/mapUtils";
import * as Toytags from "../utils/toytags";
import Global from "../global";

const router = Router();

const tp = Global.getInstance().tp;
router.post("/", (req: Request, res: Response) => {
  console.log("Creating vehicle: " + req.body.id);
  const uid = tp.randomUID();
  const vehicle = createVehicle(req.body.id, [0xefffffff, 0xefffffff], uid);
  const name = getNameFromID(req.body.id);

  console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);

  const entry = {
    name: name,
    id: req.body.id,
    uid: vehicle.uid,
    index: "-1",
    type: "vehicle",
    vehicleUpgradesP23: 0xefffffff,
    vehicleUpgradesP25: 0xefffffff,
  };
  const successfull = Toytags.addEntry(entry);

  if (successfull) {
    console.log(`Successfully created vehicle!`);
  } else {
    console.log(`Vehicle creation failed!`);
  }

  console.log("Vehicle placed: " + req.body.id);
  res.send(uid);
});
export { router as vehicleRouter };
