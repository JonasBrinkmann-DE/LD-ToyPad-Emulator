import Global from "../global";
import { RGBToHex } from "../utils/colorUtils";

class FadeAllHook implements IHook {
  handle(req: any, res: any): void {
    console.log("[HOOK] Recieved FADR_ALL");
    const top_pad_speed = req.payload[1];
    const top_pad_cycles = req.payload[2];
    const top_pad_color = RGBToHex(
      req.payload[3],
      req.payload[4],
      req.payload[5]
    );
    const left_pad_speed = req.payload[7];
    const left_pad_cycles = req.payload[8];
    const left_pad_color = RGBToHex(
      req.payload[9],
      req.payload[10],
      req.payload[11]
    );
    const right_pad_speed = req.payload[13];
    const right_pad_cycles = req.payload[14];
    const right_pad_color = RGBToHex(
      req.payload[15],
      req.payload[16],
      req.payload[17]
    );

    Global.socket.emit(IOEvents.FadeAll, [
      top_pad_speed,
      top_pad_cycles,
      top_pad_color,
      left_pad_speed,
      left_pad_cycles,
      left_pad_color,
      right_pad_speed,
      right_pad_cycles,
      right_pad_color,
    ]);
  }
}

export default new FadeAllHook();
