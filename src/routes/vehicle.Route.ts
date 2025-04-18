import { Router, Request, Response } from "express";
import { createVehicle } from "../utils/tagUtils";

import Global from "../global";
import { getEntry } from "../utils/maps/vehiclemap";
import { addEntry } from "../utils/toytags";
import { STATUS_CODES } from "http";
import { StatusCodes } from "../../node_modules/http-status-codes/build/cjs/status-codes";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  console.log("Creating vehicle: " + req.body.id);
  const uid = Global.emulator.tp.randomUID();
  const vehicle = createVehicle(req.body.id, [0xefffffff, 0xefffffff], uid);
  const name = getEntry("id", req.body.id).name;

  console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);

  const entry: IToytag = {
    name: name,
    id: req.body.id,
    uid: vehicle.uid,
    index: -1,
    type: Tagtype.Vehicle,
    upgrades: {
      page23: 0xefffffff,
      page25: 0xefffffff,
    },
  };
  const wasSuccessfull = addEntry(entry);

  if (wasSuccessfull) {
    console.log(`Successfully created vehicle!`);
    res.status(StatusCodes.CREATED).send(uid);
    return;
  }

  console.log(`Vehicle creation failed!`);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR);
});
export { router as vehicleRouter };
