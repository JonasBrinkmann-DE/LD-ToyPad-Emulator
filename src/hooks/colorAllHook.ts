import Global from "../global";
import { RGBToHex } from "../utils/colorUtils";

class ColorAllHook implements IHook {
  handle(req: any, res: any): void {
    console.log("    => CMD_COLAL");
    const top_pad_color = RGBToHex(
      req.payload[1],
      req.payload[2],
      req.payload[3]
    );
    const left_pad_color = RGBToHex(
      req.payload[5],
      req.payload[6],
      req.payload[7]
    );
    const right_pad_color = RGBToHex(
      req.payload[9],
      req.payload[10],
      req.payload[11]
    );

    Global.io.emit(IOEvents.ColorAll, [
      top_pad_color,
      left_pad_color,
      right_pad_color,
    ]);
  }
}

export default new ColorAllHook();
