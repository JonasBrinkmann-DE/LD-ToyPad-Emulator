import express, { Request, Response } from "express";
import { tp } from "bridge";
import { select, updateKey } from "utils/toytags";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
  const uid = req.params.uid;

  const entry = select("uid", uid);

  if (entry?.index === -1) {
    res.status(400).send();
    return;
  }

  tp.remove(entry?.index);
  updateKey(uid, "index", -1);
  res.status(200).send();
});
export default router;
