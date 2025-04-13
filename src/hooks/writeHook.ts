import Global from "../global";
import { getNameFromID } from "../utils/mapUtils";
import * as Toytags from "../utils/toytags";

class WriteHook implements IHook {
  handle(req: any, res: any): void {
    const ind = req.payload[0];
    const page = req.payload[1];
    const data = req.payload.slice(2);
    const uid = Toytags.getUIDFromIndex("2");
    console.log("REQUEST (CMD_WRITE): index:", ind, "page", page, "data", data);

    //The ID is stored in page 24
    if (page == 24 || page == 36) {
      Toytags.updateData(uid, "id", data.readInt16LE(0));
      const name = getNameFromID(data.readInt16LE(0));
      Toytags.updateData(uid, "name", name);
      Toytags.updateData(uid, "type", "vehicle");
      //writeVehicleData(uid, "uid", tp.randomUID())
    }
    //Vehicle uprades are stored in Pages 23 & 25
    else if (page == 23 || page == 35)
      Toytags.updateData(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
    else if (page == 25 || page == 37) {
      Toytags.updateData(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
      Global.io.emit(IOEvents.RefreshTokens); //Refreshes the html's tag gui.
    }
    res.payload = Buffer.from([0x00]);
    const token = Global.emulator._tokens.find((t) => t.index == ind);
    if (token) {
      req.payload.copy(token.token, 4 * page, 2, 6);
    }
  }
}
export default new WriteHook();
