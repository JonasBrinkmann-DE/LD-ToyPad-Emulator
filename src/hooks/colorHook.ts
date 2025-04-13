import Global from "../global";
import { RGBToHex } from "../utils/colorUtils";

class ColorHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_COL");
    console.log("    => pad:", req.payload[0]);
    console.log("    => red:", req.payload[1]);
    console.log("    => green:", req.payload[2]);
    console.log("    => blue:", req.payload[3]);
    const pad_number = req.payload[0];
    const pad_color = RGBToHex(req.payload[1], req.payload[2], req.payload[3]);
    if (pad_number == 0) {
      Global.io.emit(IOEvents.ColorAll, [pad_color, pad_color, pad_color]);
    } else {
      Global.io.emit(IOEvents.ColorOne, [pad_number, pad_color]);
    }
  }
}
export default new ColorHook();
