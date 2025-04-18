import Global from "../global";
import { getNameFromID } from "../utils/mapUtils";
import * as Toytags from "../utils/toytags";

class WriteHook implements IHook {
  handle(req: any, res: any): void {
    const index = req.payload[0];
    const page = req.payload[1];
    const data = req.payload.slice(2);
    const uid = Toytags.getEntry("index", index)?.uid;
    console.log(
      "REQUEST (CMD_WRITE): index:",
      index,
      "page",
      page,
      "data",
      data
    );

    //The ID is stored in page 24
    if (page == 24 || page == 36) {
      const id = data.readInt16LE(0);
      const name = getNameFromID(id);
      Toytags.storeData(uid, "id", id);
      Toytags.storeData(uid, "name", name);
      Toytags.storeData(uid, "type", "vehicle");
    }
    //Vehicle uprades are stored in Pages 23 & 25
    else if (page == 23 || page == 35)
      Toytags.storeData(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
    else if (page == 25 || page == 37) {
      Toytags.storeData(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
    } else if (page == 26 || page == 38) {
      //TODO: Not sure if this works
      Global.socket.emit(IOEvents.RefreshTokens);
    }
    res.payload = Buffer.from([0x00]);
    const token = Global.emulator._tokens.find((t: any) => t.index == index);
    if (token) {
      req.payload.copy(token.token, 4 * page, 2, 6);
    }
  }
}
export default new WriteHook();
