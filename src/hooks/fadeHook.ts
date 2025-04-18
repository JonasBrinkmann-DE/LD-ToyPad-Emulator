import Global from "../global";
import { RGBToHex } from "../utils/colorUtils";

class FadeHook implements IHook {
  handle(req: any, res: any): void {
    console.log("[HOOK] Recieved FADE");
    const pad_number = req.payload[0];
    const pad_speed = req.payload[1];
    const pad_cycles = req.payload[2];
    const pad_color = RGBToHex(req.payload[3], req.payload[4], req.payload[5]);

    Global.socket.emit(IOEvents.FadeOne, [
      pad_number,
      pad_speed,
      pad_cycles,
      pad_color,
    ]);
  }
}

export default new FadeHook();
