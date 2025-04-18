import Global from "../global";
import { RGBToHex } from "../utils/colorUtils";

class FlashHook implements IHook {
  handle(req: any, res: any): void {
    console.log("[HOOK] CMD_FLASH");

    const pad_number = req.payload[0];
    const col_duration = req.payload[1];
    const white_duration = req.payload[2];
    const cycles = req.payload[3];
    const pad_color = RGBToHex(req.payload[4], req.payload[5], req.payload[6]);

    Global.socket.emit(IOEvents.Flash, [
      pad_number,
      col_duration,
      white_duration,
      cycles,
      pad_color,
    ]);
  }
}

export default new FlashHook();
