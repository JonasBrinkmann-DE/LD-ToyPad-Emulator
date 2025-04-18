import { Router, Request, Response } from "express";
import Global from "../global";
import * as Toytags from "../utils/toytags";
const router = Router();

router.delete("/", (req: Request, res: Response) => {
  console.log("Removing item: " + req.body.index);
  // console.log('DEBUG: pad-from-token: ', tp._tokens.filter(v => v.index == request.body.index)[0].pad);
  Global.emulator.tp.remove(req.body.index);
  console.log("Item removed: " + req.body.index);
  Toytags.updatePadIndex(req.body.uid, -1);
  res.send(true);
});
export { router as removeRouter };
